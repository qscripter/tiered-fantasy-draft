Template.teamDetail.team = function () {
	return Teams.findOne(Session.get("selectedTeam"));
};

Template.teamDetail.player = function () {
	return Players.findOne(this.player_id);
};

Template.teamDetail.bidEdit = function () {
	return Session.get("bidEdit") == this.player_id;
};

Template.teamDetail.contractEdit = function () {
	return Session.get("contractEdit") == this.player_id;
};

Template.teamDetail.contractValue = function () {
	return this.bid * this.contractYears;
}

Template.teamDetail.contractYearsEditable = function () {
	team = Teams.findOne(Session.get("selectedTeam"));
	if (team) {
		return (team.owner == Meteor.user()._id && this.currentYear == 1) || Roles.userIsInRole(Meteor.user()._id, ['admin']);
	}
}

Template.teamDetail.salaryEdit = function (parent) {
	if (parent) {
		return Session.get("editContract") == parent.player_id;
	}
}

Template.teamDetail.yearEditable = function (parent) {
	team = Teams.findOne(Session.get("selectedTeam"));
	if (team) {
		return (team.owner == Meteor.user()._id && this.year >= parent.currentYear) || Roles.userIsInRole(Meteor.user()._id, ['admin']);
	}
}

Template.teamDetail.contractEdit = function () {
	return Session.get("editContract") == this.player_id;
}

Template.teamDetail.contractEditable = function () {
	team = Teams.findOne(Session.get("selectedTeam"));
	if (team) {
		return (team.owner == Meteor.user()._id || Roles.userIsInRole(Meteor.user()._id, ['admin'])) && this.contractYears > 1;
	}
	return false;
}

Template.teamDetail.currentYearEdit = function () {
	return Session.get("currentYearEdit") == this.player_id;
}

Template.teamDetail.availableContractYears = function () {
	arr = [];
	for (var i=1; i<5; i++) {
		arr.push({year: i, selected: i==this.contractYears});
	};
	return arr;
}

Template.teamDetail.bonusTotal = function() {
	return Math.ceil(this.bid / 2) * this.contractYears;
}

Template.teamDetail.salaryTotal = function () {
	return (this.bid - Math.ceil(this.bid/2)) * this.contractYears;
}

Template.teamDetail.contractTotals = function () {
	var contractTotals = []
	var team = Teams.findOne(Session.get("selectedTeam"));
	if (team) {
		for (var i=0; i<4; i++) {
			var bonusTotal = 0;
			var salaryTotal = 0;
			for (var j=0; j< team.roster.length; j++) {
				salaryYear = team.roster[j].salaryAllocation[team.roster[j].currentYear - 1 + i];
				if (salaryYear) {
					bonusTotal += parseInt(salaryYear.bonus,10);
					salaryTotal += parseInt(salaryYear.salary,10);
				}
			}
			contractTotals.push({
				index: i,
				bonus: bonusTotal,
				salary: salaryTotal,
				total: bonusTotal + salaryTotal,
				remaining: 100 - bonusTotal - salaryTotal
			})
		}
		return contractTotals;
	}
}

Template.teamDetail.rendered = function () {
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

	$('.callout').tooltip();
	//$('.tt-query').css('background-color','#fff');
};

Template.teamDetail.events({
	'click #addPlayer': function (event) {
		var playerName = $("#playerName").val();
		Meteor.call("addPlayerToTeam", playerName, Session.get("selectedTeam"));
		$("#playerName").val("");
	},
	'click .deletePlayer': function (event) {
		Meteor.call("removePlayerFromTeam", this.player_id, Session.get("selectedTeam"));
	},
	'click .bid': function (event) {
		if (Roles.userIsInRole(Meteor.user(), ['admin'])) {
			Session.set("bidEdit", this.player_id);
		}
	},
	'keydown .bidInput': function (event) {
		if (event.keyCode == 13) {
			var salary = $(event.target).val();
			Meteor.call("updatePlayerBid", Session.get("selectedTeam"), this.player_id, salary);
			Session.set("bidEdit", null);
		}
	},
	'keydown #playerName': function (event) {
		if (event.keyCode ==13) {
			var playerName = $("#playerName").val();
			Meteor.call("addPlayerToTeam", playerName, Session.get("selectedTeam"));
			$("#playerName").val("");
		}
	},
	'click .edit-years': function (event) {
		Session.set('editContract', this.player_id);
	},
	'change .contract-years': function (event) {
		var contractYears = $(event.target).val();
		Meteor.call("updatePlayerContract", Session.get("selectedTeam"), this.player_id, contractYears);
	},
	'click .save-contract': function () {
		var salaryAllocation = []
		for (var i=1; i<=this.contractYears; i++) {
			var bonus = parseInt($('#' + this.player_id + '-year-' + i + '-bonus').val(), 10);
			var salary = parseInt($('#' + this.player_id + '-year-' + i + '-salary').val(), 10);
			salaryAllocation.push({year: i, bonus: bonus, salary: salary});
		}
		Meteor.call("updateSalaryAllocation", Session.get("selectedTeam"), this.player_id, salaryAllocation);
		Session.set("editContract", null);
	},
	'click .current-year': function () {
		if (Roles.userIsInRole(Meteor.user(), ['admin'])) {
			Session.set("currentYearEdit", this.player_id);
		}
	},
	'keydown #current-year-edit': function (event) {
		if (event.keyCode == 13) {
			var currentYear = $(event.target).val();
			Meteor.call("updateCurrentYear", Session.get("selectedTeam"), this.player_id, currentYear);
			Session.set("currentYearEdit", null);
		}
	}
});