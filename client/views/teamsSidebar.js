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
	return null;
};

Template.teamsSidebar.playerCount = function () {
	return this.roster.length;
}

Template.teamsSidebar.salaryCommitted = function () {
	return _.reduce(this.roster, function (memo, contract){
		var salaryYear = _.find(contract.salaryAllocation, function (allocation){
			return allocation.year == contract.currentYear
		});
		return memo + salaryYear.salary + salaryYear.bonus;
	}, 0);
	return null;
};