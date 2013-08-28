Template.tiers.tiers = function () {
	return Tiers.find();
};

Template.tiers.events({
	'click #createTier': function (event) {
		var tierName = $('#tierName').val();
		data = {
			name: tierName,
			players: [],
			bids: [],
			submissions: []
		};
		Tiers.insert(data);
		$('#tierName').val("");
	},
	'click .activeRadio': function (event) {
		Meteor.call("setActiveTier", this._id);
	}
});