Template.teams.teams = function () {
	return Teams.find();
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