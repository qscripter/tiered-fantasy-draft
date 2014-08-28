Template.tiers.tiers = function () {
	return Tiers.find({}, {sort: {name: 1}});
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
	},
	'click .deleteTier': function (event) {
		Meteor.call("deleteTier", this._id);
	},
	'keydown #tierName': function (event) {
		if (event.keyCode == 13) {
			var tierName = $('#tierName').val();
			data = {
				name: tierName,
				players: [],
				bids: [],
				submissions: []
			};
			Tiers.insert(data);
			$('#tierName').val("");
			event.preventDefault();
		}
	}
});