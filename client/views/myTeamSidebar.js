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