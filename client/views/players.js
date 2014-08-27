Template.players.players = function () {
	return Players.find({}, {sort: {position: -1, name: 1}});
};

Template.players.owner = function () {
	return Teams.findOne({"roster.player_id": this._id})
};

Template.players.teams = function () {
	return Teams.find();
}

Template.players.isRfaTeam = function (parent) {
	if (parent.rfa) {
		return Teams.findOne(parent.rfa)._id == this._id;
	}
	return false;
}

Template.players.tier = function () {
	return Tiers.findOne({"players": this._id});
}

Template.players.rfaTeam = function () {
	return Teams.findOne(this.rfa);
}



Template.players.events({
	'change .rfa': function (event) {
		var teamId = $(event.target).val()
		if (teamId == "") {
			Meteor.call('setPlayerRfa', this._id, null);
		} else {
			Meteor.call('setPlayerRfa', this._id, teamId);
		}
	}
})