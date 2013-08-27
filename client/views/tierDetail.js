Template.tierDetail.tier = function () {
	return Tiers.findOne(Session.get("selectedTier"));
};

Template.tierDetail.players = function () {
	var tier = Tiers.findOne(Session.get("selectedTier"));
	if (tier) {
		return Players.find({_id: {$in: tier.players}});
	}
};

Template.tierDetail.indexOfPlayer = function (playerId) {
	var tier = Tiers.findOne(Session.get("selectedTier"));
	return _.indexOf(tier.players, playerId) + 1;
};