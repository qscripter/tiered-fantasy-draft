Template.teams.teams = function () {
	return Teams.find();
};

Template.teams.ownerEmail = function () {
	var owner = Meteor.users.findOne(this.owner);
	if (owner) {
		return owner.emails[0].address;
	}
};

Template.teams.users = function () {
	return Meteor.users.find();
};

Template.teams.email = function () {
	return this.emails[0].address;
};

Template.teams.owner = function (teamId) {
	var team = Teams.findOne({owner: this._id});
	if (team) {
		return team._id == teamId;
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
	},
	'click .deleteTeam': function (event) {
		Meteor.call('deleteTeam', this._id);
	},
	'change .ownerSelect': function (event) {
		var email = $(event.target).val();
		Meteor.call("setTeamOwner", this._id, email);
	}
});