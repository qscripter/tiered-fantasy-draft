Template.teamsSidebar.teams = function () {
	return Teams.find();
};

Template.teamsSidebar.bidSubmitted = function () {
	var tier = Tiers.findOne(Session.get("selectedTier"));
	var team = this;
	if (tier) {
		return _.find(tier.submissions, function (submission) {
			return submission.team == team._id;
		});
	}
};