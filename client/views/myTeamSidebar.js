function getPositionPlayers (position) {
	var myTeam = Teams.findOne({owner: Meteor.userId()});
	if (myTeam) {
		var playerIds = _.map(myTeam.roster, function (roster) {
			return roster.player_id;
		});
		var players = Players.find({$and: [{_id: {$in: playerIds}}, {position: position}]});
		return players;
	}
}

Template.myTeamSidebar.team = function () {
	var myTeam = Teams.findOne({owner: Meteor.userId()});
	return myTeam;
};

Template.myTeamSidebar.player = function () {
	return Players.findOne(this.player_id);
};

Template.myTeamSidebar.totalSalary = function () {
	var myTeam = Teams.findOne({owner: Meteor.userId()});
	if (myTeam) {
		var salary = _.reduce(myTeam.roster, function (memo, roster) {
			return memo + roster.salary;
		}, 0);
		return salary;
	}
};

Template.myTeamSidebar.maxBid = function () {
	var myTeam = Teams.findOne({owner: Meteor.userId()});
	if (myTeam) {
		var salary = _.reduce(myTeam.roster, function (memo, roster) {
			return memo + roster.salary;
		}, 0);
		// minimum players needed
		return 100 - salary - (17 - myTeam.roster.length) * 2;
	}
};

Template.myTeamSidebar.league = function () {
	return Leagues.findOne();
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
		return requiredPlayers - players.count();
	}
};

Template.myTeamSidebar.getSalary = function (playerId) {
	var myTeam = Teams.findOne({owner: Meteor.userId()});
	if (myTeam) {
		return _.find(myTeam.roster, function (roster) {
			return roster.player_id == playerId;
		}).salary;
	}
};

Template.myTeamSidebar.playersNeeded = function () {
	var league = Leagues.findOne();
	var myTeam = Teams.findOne({owner: Meteor.userId()});
	if (league && myTeam) {
		return league.minRosterSize - myTeam.roster.length;
	}
};