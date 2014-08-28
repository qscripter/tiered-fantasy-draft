function getPositionPlayers (position) {
	var myTeam = Teams.findOne(Session.get("selectedSidebarTeam"));
	if (myTeam) {
		var playerIds = _.map(myTeam.roster, function (roster) {
			return roster.player_id;
		});
		var players = Players.find({$and: [{_id: {$in: playerIds}}, {position: position}]}, {sort: {rank: 1}});
		return players;
	}
}


Template.myTeamSidebar.team = function () {
	var myTeam = Teams.findOne(Session.get("selectedSidebarTeam"));
	return myTeam || null;
};

Template.myTeamSidebar.teams = function () {
	return Teams.find();
};

Template.myTeamSidebar.owner = function () {
	return this.owner == Meteor.userId();
};

Template.myTeamSidebar.player = function () {
	return Players.findOne(this.player_id);
};

Template.myTeamSidebar.totalSalary = function () {
	var myTeam = Teams.findOne(Session.get("selectedSidebarTeam"));
	if (myTeam) {
		return _.reduce(myTeam.roster, function (memo, contract){
			var salaryYear = _.find(contract.salaryAllocation, function (allocation){
				return allocation.year == contract.currentYear
			});
			return memo + salaryYear.salary + salaryYear.bonus;
		}, 0);
	}
};

Template.myTeamSidebar.maxBid = function () {
	var myTeam = Teams.findOne(Session.get("selectedSidebarTeam"));
	if (myTeam) {
		var salary = _.reduce(myTeam.roster, function (memo, contract){
			var salaryYear = _.find(contract.salaryAllocation, function (allocation){
				return allocation.year == contract.currentYear
			});
			return memo + salaryYear.salary + salaryYear.bonus;
		}, 0);
		// minimum players needed
		return 100 - salary - (17 - myTeam.roster.length) * 2;
	}
	return null;
};

Template.myTeamSidebar.league = function () {
	return Leagues.findOne() || null;
};


Template.myTeamSidebar.getPositionPlayers = function (position) {
	return getPositionPlayers(position);
};


Template.myTeamSidebar.remainingSlots = function (position) {
	var players = getPositionPlayers(position);
	var league = Leagues.findOne();
	if (league && players) {
		var requiredPlayers = _.filter(league.positions, function (item) {
			return item.position == position;
		})[0].required;
		var positions = []
		var i=0;
		while (i<(requiredPlayers - players.count())) {
			positions[i] = position;
			i++;
		}
		return positions;
	}
	return null;
};


Template.myTeamSidebar.getSalary = function (playerId) {
	var myTeam = Teams.findOne(Session.get("selectedSidebarTeam"));
	if (myTeam) {
		var contract = _.find(myTeam.roster, function (roster) {
			return roster.player_id == playerId;
		});
		var currentSalary = _.find(contract.salaryAllocation, function(salaryYear) {
			return salaryYear.year == contract.currentYear;
		});
		return currentSalary.bonus + currentSalary.salary;
	}
	return null;
};

Template.myTeamSidebar.playersNeeded = function () {
	var league = Leagues.findOne();
	var myTeam = Teams.findOne(Session.get("selectedSidebarTeam"));
	if (league && myTeam) {
		return league.minRosterSize - myTeam.roster.length;
	}
	return null;
};

Template.myTeamSidebar.events({
	'click .teamSelect': function (event) {
		Session.set("selectedSidebarTeam", this._id);
	}
});