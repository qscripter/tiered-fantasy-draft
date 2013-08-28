Template.teamDetail.team = function () {
	return Teams.findOne(Session.get("selectedTeam"));
};

Template.teamDetail.player = function () {
	return Players.findOne(this.player_id);
};

Template.teamDetail.salaryEdit = function () {
	return Session.get("salaryEdit") == this.player_id;
};

Template.teamDetail.contractEdit = function () {
	return Session.get("contractEdit") == this.player_id;
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
	},
	'click .salary': function (event) {
		Session.set("salaryEdit", this.player_id);
	},
	'keydown .salaryInput': function (event) {
		if (event.keyCode == 13) {
			var salary = $(event.target).val();
			Meteor.call("updatePlayerSalary", Session.get("selectedTeam"), Session.get("salaryEdit"), salary);
			Session.set("salaryEdit", null);
		}
	},
	'click .contract': function (event) {
		Session.set("contractEdit", this.player_id);
	},
	'keydown .contractInput': function (event) {
		if (event.keyCode == 13) {
			var contractYears = $(event.target).val();
			Meteor.call("updatePlayerContract", Session.get("selectedTeam"), Session.get("contractEdit"), contractYears);
			Session.set("contractEdit", null);
		}
	}
});