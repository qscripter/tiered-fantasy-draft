function findMaxValidBid (team) {
	var salary = _.reduce(team.roster, function (memo, contract){
		var salaryYear = _.find(contract.salaryAllocation, function (allocation){
			return allocation.year == contract.currentYear
		});
		return memo + salaryYear.salary + salaryYear.bonus;
	}, 0);
	// minimum players needed
	return 100 - salary - (17 - team.roster.length) * 2;
}

function findMaxEffectiveBid(maxPlayers, bids) {
	var numericalBids = _.map(bids, function(bid) {
		var num = parseInt(bid.bid, 10);
		if (num) {
			return num;
		} else {
			return 0;
		}
	});

	var sortedBids = _.sortBy(numericalBids, function(num) {
		return -num;
	});

	var maxTotalBid = _.reduce(sortedBids.slice(0,maxPlayers), function(memo, num) {
		return memo + num;
	}, 0);
	return maxTotalBid;
}

function calculateWinningBid(tierId, playerId) {
	var tier,
		submissionsInContention,
		teamsInContention,
		bids,
		winningBids,
		winningBid,
		winningSalary,
		winningTeam,
		rosterEntry;
	tier = Tiers.findOne(tierId);

	// filter out submissions that have already gotten their quota of players
	submissionsInContention = _.filter(tier.submissions, function (submission) {
		return submission.maxPlayers > submission.playersWon;
	});

	// extract team ids from submissions in contention
	teamsInContention = _.map(submissionsInContention, function (submission) {
		return submission.team;
	});

	// narrow the bids down to the correct players and teams in contention
	bids = Bids.find({$and: [{player: playerId}, {team: {$in: teamsInContention}}, {bid: {$gt: 1}}]}, {sort: {bid: -1}}).fetch();

	// find all the max bids, remeber bids[0] is the maximum bid
	winningBids = [];
	var i = 0;
	while (bids.length > i && bids[i].bid == bids[0].bid) {
		winningBids.push(bids[i]);
		i++;
	}

	if (winningBids.length > 0) { // there must be at least one winner
		// case where there is one maximum bidder
		if (winningBids.length == 1) {
			winningTeam = winningBids[0].team;
			// determine winning salary
			if (bids.length == 1) {
				// only one remaining bidder
				winningSalary = 2; // minimum salary
			} else {
				winningSalary = bids[1].bid + 1; // next lowest salary + 1
			}
		} else {  // case for a tie
			winningTeam = _.shuffle(winningBids)[0].team; // shuffle the winning bids and take 0 index, ie randomly select the winning team
			winningSalary = winningBids[0].bid;
		}

		winningBid = {
			player: playerId,
			team: winningTeam,
			salary: winningSalary
		};

		// add player to winning team
		bonus = Math.ceil(winningSalary / 2);
		salary = winningSalary - bonus;
		rosterEntry = {
			player_id: playerId,
			bid: winningSalary,
			contractYears: 1,
			currentYear: 1,
			salaryAllocation: [
				{year: 1, salary: salary, bonus: bonus}
			],
			rookie: false
		};
		// add player to team
		Teams.update(winningBid.team, {$push: {roster: rosterEntry}});
		// increment the won player total for the team in the tier
		Tiers.update({
			_id: tierId,
			"submissions.team": winningBid.team
		},
		{$inc: {'submissions.$.playersWon': 1}});
		Tiers.update(tierId, {$push: {winningBids: winningBid}});
	}
}

function calculateTierWinners(tierId) {
	var tier = Tiers.findOne(tierId);
	// see if all bids have been submitted
	if (tier.submissions.length == Teams.find().count()) {
		_.each(tier.players, function (player) {
			calculateWinningBid(tierId, player);
		});
		// set Tier to complete
		Tiers.update(tierId, {$set: {complete: true}});
	}
}


Meteor.methods({
	updatePlayerBid: function (teamId, playerId, bid) {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			bid = parseInt(bid, 10);
			var bonus, salary, salaryAllocation;
			if (bid > 1) {
				bonus = Math.ceil(bid / 2);
				salary = bid - bonus;
				Teams.update({
					_id: teamId,
					"roster.player_id": playerId
				},
				{$set: {
					'roster.$.bid': bid,
					'roster.$.salaryAllocation.0.bonus': bonus,
					'roster.$.salaryAllocation.0.salary': salary
				}});
			} else {
				salaryAllocation = [
					{year: 1, salary: 1, bonus: 0},
					{year: 2, salary: 1, bonus: 0},
					{year: 3, salary: 1, bonus: 0}
				]
				Teams.update({
					_id: teamId,
					"roster.player_id": playerId
				},
				{$set: {
					'roster.$.bid': bid,
					'roster.$.salaryAllocation': salaryAllocation,
					'roster.$.contractYears': 3
				}});
			}
			

		}
	},
	updatePlayerContract: function (teamId, playerId, contractYears) {
		// update permissions here, allow owners to update contracts for their players if in first contract year
		var team = Teams.findOne(teamId);
		var maxBid = findMaxValidBid(team);
		var contract = _.find(team.roster, function(contract) {
			return contract.player_id == playerId;
		});
		if (Roles.userIsInRole(this.userId, ['admin']) || (team.owner == this.userId && contract.currentYear == 1)) {
			var bid, bonus, salary, salaryAllocation, i, roster;
			contractYears = parseInt(contractYears, 10);

			Teams.update({
				_id: teamId,
				"roster.player_id": playerId
			},
			{$set: {'roster.$.contractYears': contractYears}});

			// update for other contract years
			roster = team.roster;
			bid = contract.bid;
			if (bid == 1) {
				salaryAllocation = [
					{year: 1, bonus: 0, salary: 1},
					{year: 2, bonus: 0, salary: 1},
					{year: 3, bonus: 0, salary: 1},
				];
			} else {
				bonusTotal = Math.ceil(bid *contractYears / 2);
				salaryTotal = bid * contractYears - bonusTotal;
				salaryAllocation = [];
				i = 0;
				while(i<contractYears) {
					var bonus, salary;
					// spread bonus evenly
					bonus = Math.ceil(bonusTotal / (contractYears - i));
					// 25% of salary in 1st year, rest is spread evenly
					if (i == 0) {
						salary = Math.ceil((salaryTotal + bonusTotal) / 4);
					} else {
						salary = Math.ceil(salaryTotal / (contractYears - i));
					}
					salaryAllocation.push({
						year: i+1,
						bonus: bonus,
						salary: salary,
					})
					bonusTotal -= bonus;
					salaryTotal -= salary;
					i++;
				}
			}
			Teams.update({
				_id: teamId,
				"roster.player_id": playerId
			},
			{$set: {'roster.$.salaryAllocation': salaryAllocation}});


		}
	},
	updateCurrentYear: function (teamId, playerId, currentYear) {
		currentYear = parseInt(currentYear, 10);
		if (currentYear > 0 && currentYear < 5) {
			Teams.update({
				_id: teamId,
				"roster.player_id": playerId
			},
			{$set: {'roster.$.currentYear': currentYear}});
		}
	},
	updateSalaryAllocation: function (teamId, playerId, salaryAllocation) {
		//validate salaryAllocation
		// all salaries must be >0, sum of salaries must add up, sum of bonus must add up
		var team = Teams.findOne(teamId);
		if (Roles.userIsInRole(this.userId, ['admin']) || team.owner == this.userId) {
			var roster = Teams.find({
				_id: teamId,
				"roster.player_id": playerId
			}).fetch()[0].roster;
			var team = Teams.findOne(teamId);
			var maxBid = findMaxValidBid(team);
			var contract = _.find(roster, function(contract) {return contract.player_id == playerId});
			var bonusTotal = Math.ceil(contract.bid * contract.contractYears / 2 );
			var salaryTotal = contract.bid * contract.contractYears - bonusTotal;
			var salaryGreaterThanOne = true;
			var underCap = salaryAllocation[0].bonus + salaryAllocation[0].salary < maxBid;
			for (var i=0; i < salaryAllocation.length; i++) {
				salaryGreaterThanOne == salaryGreaterThanOne && salaryAllocation[i].salary > 0;
				salaryTotal = salaryTotal - salaryAllocation[i].salary;
				bonusTotal = bonusTotal - salaryAllocation[i].bonus;
			}
			if (salaryGreaterThanOne && salaryTotal == 0 && bonusTotal == 0 && salaryAllocation.length == contract.contractYears && underCap) {
				Teams.update({
					_id: teamId,
					"roster.player_id": playerId
				},
				{$set: {'roster.$.salaryAllocation': salaryAllocation}});
			}
		};
	},
	submitBids: function (tierId, maxPlayers, bids) {
		// make sure the bids are being entered for the active round
		var tier = Tiers.findOne(tierId);
		var team = Teams.findOne({owner: this.userId});
		var bidSubmitted = _.find(tier.submissions, function (submission) {
			return submission.team == team._id;
		});
		if (tier && tier.active && team && !bidSubmitted) {
			// check if bid is valid ie below the maximum allowable
			if (findMaxValidBid(team) >= findMaxEffectiveBid(maxPlayers, bids)) {
				// create bid objects for players
				_.each(bids, function (bid) {
					var bidInt = parseInt(bid.bid, 10);
					if (!bidInt) {
						bidInt = 0;
					}
					var data = {
						team: team._id,
						player: bid.player_id,
						bid: bidInt
					};
					Bids.insert(data);
				});
				// mark player bids as submitted within the Tier
				var submission = {
					team: team._id,
					maxPlayers: maxPlayers,
					playersWon: 0
				};
				Tiers.update(tierId, {$push: {submissions: submission}});
				calculateTierWinners(tierId);
			}
		}
	},
	deleteTeam: function (teamId) {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			Teams.remove(teamId);
			Bids.remove({team: teamId});
			Tiers.update({"submissions.team": teamId}, {$pull: {submissions: {team: teamId}}}, {multi: true});
		}
	},
	deleteTier: function (tierId) {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			var tier = Tiers.findOne(tierId);
			Bids.remove({player: {$in: tier.players}});
			// undo roster adds from tier
			_.each(tier.players, function (player) {
				Teams.update({"roster.player_id": player}, {$pull: {roster: {player_id: player}}});
			});
			Tiers.remove(tierId);
		}
	},
	rollTierBack: function (tierId) {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			var tier = Tiers.findOne(tierId);
			Bids.remove({player: {$in: tier.players}});
			// undo roster adds from tier
			_.each(tier.players, function (player) {
				Teams.update({"roster.player_id": player}, {$pull: {roster: {player_id: player}}});
			});
			Tiers.update(tierId, {$set: {complete: false}});
			Tiers.update(tierId, {$set: {winningBids: []}});
			Tiers.update(tierId, {$set: {submissions: []}});
		}
	},
	setTeamOwner: function (teamId, email) {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			var user = Meteor.users.findOne({"emails.0.address": email});
			if (user && Teams.find({owner: user._id}).count() === 0) {
				Teams.update(teamId, {$set: {owner: user._id}});
			} else if (email === "") {
				Teams.update(teamId, {$set: {owner: ""}});
			}
		}
	},
	resetPlayers: function() {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			Players.remove({});
			if (Players.find().fetch().length === 0) {
				for (var i=0; i<nfl_players.length; i++) {
					Players.insert(nfl_players[i]);
				}
			}
		}
	},
	addDst: function () {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			for (var i=0; i<nfl_dst.length; i++) {
				Players.insert(nfl_dst[i]);
			}
		}
	},
	setPlayerRfa: function (playerId, teamId) {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			Players.update(playerId, {$set: {rfa: teamId}});
		}
	},
	moveTierPlayer: function (playerId, newIndex) {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			var tier = Tiers.findOne({"players": playerId});
			var newPlayerArray = _.without(tier.players, playerId);
			newPlayerArray.splice(newIndex, 0, playerId)
			Tiers.update(tier._id, {$set: {players: newPlayerArray}});
		}
	},
	addPlayerSorts: function () {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			var positions = Leagues.findOne().positions
			for (var i=0; i < positions.length; i++) {
				Players.update({position: positions[i].position}, {$set: {positionSort: i}}, {multi: true});
			}
			Players.remove({position: "DST"}, {multi: true});
		}
	}
});