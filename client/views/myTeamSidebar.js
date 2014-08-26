function getPositionPlayers (position) {
	var myTeam = Teams.findOne(Session.get("selectedSidebarTeam"));
	if (myTeam) {
		var playerIds = _.map(myTeam.roster, function (roster) {
			return roster.player_id;
		});
		var players = Players.find({$and: [{_id: {$in: playerIds}}, {position: position}]});
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
		var salary = _.reduce(myTeam.roster, function (memo, roster) {
			return memo + roster.salary;
		}, 0);
		return salary;
	}
	return null;
};

Template.myTeamSidebar.maxBid = function () {
	var myTeam = Teams.findOne(Session.get("selectedSidebarTeam"));
	if (myTeam) {
		var salary = _.reduce(myTeam.roster, function (memo, roster) {
			return memo + roster.salary;
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
		return _.find(myTeam.roster, function (roster) {
			return roster.player_id == playerId;
		}).salary;
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