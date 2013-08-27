Template.teams.teams = function () {
	return Teams.find();
};

Template.teams.ownerEmail = function () {
	var owner = Meteor.users.findOne(this.owner);
	if (owner) {
		return owner.emails[0].address;
	}
};

Template.teams.events({
	'click #createTeam': function (event) {
		var teamName = $('#teamName').val();
		data = {
			name: teamName,
			roster: []
		};
		Teams.insert(data);
		$('#teamName').val("");
	}
});