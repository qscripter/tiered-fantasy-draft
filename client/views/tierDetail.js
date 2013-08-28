Template.tierDetail.tier = function () {
	return Tiers.findOne(Session.get("selectedTier"));
};

Template.tierDetail.players = function () {
	var tier = Tiers.findOne(Session.get("selectedTier"));
	if (tier) {
		var players = [];
		for (var i=0; i < tier.players.length; i++) {
			players.push(Players.findOne(tier.players[i]));
		}
		return players;
	}
};

Template.tierDetail.indexOfPlayer = function (playerId) {
	var tier = Tiers.findOne(Session.get("selectedTier"));
	return _.indexOf(tier.players, playerId) + 1;
};

Template.tierDetail.bidSubmitted = function () {
	var tier = Tiers.findOne(Session.get("selectedTier"));
	var team = Teams.findOne({owner: Meteor.userId()});
	if (tier && team) {
		return _.find(tier.submissions, function (submission) {
			return submission.team == team._id;
		});
	}
};

Template.tierDetail.playerBid = function () {
	return Bids.findOne({player: this._id});
};

Template.tierDetail.rendered = function () {
	var players = Players.find().fetch();
	$('#playerName').typeahead({
		name: 'playerName',
		valueKey: 'name',
		local: players
	});
	//$('.tt-query').css('background-color','#fff');
};

Template.tierDetail.events({
	'click #addPlayer': function (event) {
		var playerName = $("#playerName").val();
		Meteor.call("addPlayerToTier", playerName, Session.get("selectedTier"));
	},
	'click .deletePlayer': function (event) {
		Meteor.call("removePlayerFromTier", this._id, Session.get("selectedTier"));
	},
	'click #submitBids': function (event) {
		var playersToTake = $('#playersToTake').val();
		var bidInputs = $('.bid');
		var bids = [];
		for (var i=0; i < bidInputs.length; i++) {
			var bid = {
				player_id: $(bidInputs[i]).attr('id'),
				bid: $(bidInputs[i]).val()
			};
			bids.push(bid);
		}
		Meteor.call("submitBids", Session.get("selectedTier"), playersToTake, bids);
	}
});