function findMaxBid () {
	var myTeam = Teams.findOne({owner: Meteor.userId()});
	if (myTeam) {
		var salary = _.reduce(myTeam.roster, function (memo, contract){
			var salaryYear = _.find(contract.salaryAllocation, function (allocation){
				return allocation.year == contract.currentYear
			});
			return memo + salaryYear.salary + salaryYear.bonus;
		}, 0);
		// minimum players needed
		return 100 - salary - (17 - myTeam.roster.length) * 2;
	}
}

function validateTotalBids () {
	var bids = _.map($('.bid'), function(bid) {
		return parseInt($(bid).val(), 10);
	});
	var playersToTake = $('#playersToTake').val();
	bids = _.sortBy(bids, function(num) {
		return -num;
	});
	var totalBids = _.reduce(bids.slice(0, playersToTake), function(memo, num) {
		return memo + num;
	}, 0);
	if (totalBids) {
		return Session.set("bidsValid", (findMaxBid() - totalBids) >= 0);
	} else {
		return true; // covers all blank NaN case
	}
}

Template.tierDetail.bidsValid = function () {
	return Session.get("bidsValid");
};

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
	} else {
		return null;
	}
};

Template.tierDetail.rfaTeamName = function (teamId) {
	return Teams.findOne(teamId).name;
}

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
	} else {
		return null;
	}
};

Template.tierDetail.playerBid = function () {
	return Bids.findOne({player: this._id});
};


Template.tierDetail.rendered = function () {
	var players = Players.find().fetch();
	var playersBloodhound = new Bloodhound({
		datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
		queryTokenizer: Bloodhound.tokenizers.whitespace,
		local: players
	});
	playersBloodhound.initialize();

	$('#playerName').typeahead({
		hint: true,
		highlight: true,
		minLength: 1
	},
	{
		name: 'playerName',
		displayKey: 'name',
		source: playersBloodhound.ttAdapter()
	});
	//$('.tt-query').css('background-color','#fff');
};

Template.tierDetail.created = function () {
	Session.set("bidsValid", true);
};

Template.tierDetail.events({
	'click #addPlayer': function (event) {
		var playerName = $("#playerName").val();
		Meteor.call("addPlayerToTier", playerName, Session.get("selectedTier"));
	},
	'keydown #playerName': function (event) {
		if (event.keyCode == 13) {
			var playerName = $("#playerName").val();
			Meteor.call("addPlayerToTier", playerName, Session.get("selectedTier"));
			$("#playerName").val("");
		};
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
	},
	'keyup .bid' : function (event) {
		validateTotalBids();
	},
	'change #playersToTake': function (event) {
		validateTotalBids();
	}
});