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
		var salary = 0;
		for (var i=0; i < myTeam.roster.length; i++) {
			salary = salary + myTeam.roster[i].salary;
		}
		return salary;
	}
};