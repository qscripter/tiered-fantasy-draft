Template.tierResults.tier = function () {
	return Tiers.findOne(Session.get("selectedTier"));
};

Template.tierResults.playerObj = function () {
	return Players.findOne(this.player);
};

Template.tierResults.teamObj = function () {
	return Teams.findOne(this.team);
};