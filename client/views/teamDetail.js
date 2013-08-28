Template.teamDetail.team = function () {
	return Teams.findOne(Session.get("selectedTeam"));
};

Template.teamDetail.player = function () {
	return Players.findOne(this.player_id);
};

Template.teamDetail.rendered = function () {
	var players = Players.find().fetch();
	$('#playerName').typeahead({
		name: 'playerName',
		valueKey: 'name',
		local: players
	});
	//$('.tt-query').css('background-color','#fff');
};

Template.teamDetail.events({
	'click #addPlayer': function (event) {
		var playerName = $("#playerName").val();
		Meteor.call("addPlayerToTeam", playerName, Session.get("selectedTeam"));
	},
	'click .deletePlayer': function (event) {
		Meteor.call("removePlayerFromTeam", this.player_id, Session.get("selectedTeam"));
	}
});