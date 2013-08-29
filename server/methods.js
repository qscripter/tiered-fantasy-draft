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
	rosterEntry = {
		player_id: playerId,
		salary: winningSalary,
		contractYears: 1
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
	updatePlayerSalary: function (teamId, playerId, salary) {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			salary = parseInt(salary, 10);
			Teams.update({
				_id: teamId,
				"roster.player_id": playerId
			},
			{$set: {'roster.$.salary': salary}});
		}
	},
	updatePlayerContract: function (teamId, playerId, contractYears) {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			contractYears = parseInt(contractYears, 10);
			Teams.update({
				_id: teamId,
				"roster.player_id": playerId
			},
			{$set: {'roster.$.contractYears': contractYears}});
		}
	},
	submitBids: function (tierId, maxPlayers, bids) {
		// make sure the bids are being entered for the active round
		var tier = Tiers.findOne(tierId);
		var team = Teams.findOne({owner: this.userId});
		var bidSubmitted = _.find(tier.submissions, function (submission) {
			return submission.team == team._id;
		});
		if (tier && tier.active && team && !bidSubmitted) {
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
			Tiers.remove(tierId);
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
	}
});