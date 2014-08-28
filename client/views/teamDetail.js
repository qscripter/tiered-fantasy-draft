function calculateMaxBid() {
	var myTeam = Teams.findOne(Session.get("selectedTeam"));
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

function validateContractAllocation(salaryAllocation, bid) {
	var contractYears = salaryAllocation.length;
	var totalValue = bid * contractYears;
	var calculatedBonusTotal = _.reduce(salaryAllocation, function(memo, salaryYear) {
		return memo + salaryYear.bonus;
	}, 0);
	var calculatedSalaryTotal = _.reduce(salaryAllocation, function(memo, salaryYear) {
		return memo + salaryYear.salary;
	}, 0);
	if (salaryAllocation[0].salary < 0.25 * totalValue) {
		Session.set("salaryError", "The first year's salary of a contract must be at least 25% of the contract's total value.");
		return false;
	}
	if (Math.ceil(totalValue/2) != calculatedBonusTotal) {
		Session.set("salaryError", "Your bonus numbers don't add up.");
		return false;
	}
	if (Math.floor(totalValue/2) != calculatedSalaryTotal) {
		Session.set("salaryError", "Your salary numbers don't add up.");
		return false;
	}
	if ((salaryAllocation[0].salary + salaryAllocation[0].bonus) > (calculateMaxBid() - bid)) {
		Session.set("salaryError", "This contract would violate your salary cap!");
		return false;
	}
	for (var i=0; i<salaryAllocation.length; i++) {
		if (salaryAllocation[i].salary == 0) {
			Session.set("salaryError", "Salary must not be 0 for any contract year.");
			return false;
		}
	}
	Session.set("salaryError", "");
	return true;
}

Template.teamDetail.team = function () {
	return Teams.findOne(Session.get("selectedTeam"));
};

Template.teamDetail.salaryError = function () {
	return Session.get("salaryError");
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

Template.teamDetail.contractYearClass= function (parent) {
	if (parent.currentYear > this.year) {
		return "past-contract-year";
	} else if (parent.currentYear == this.year) {
		return "current-contract-year";
	} else {
		return "future-contract-year";
	}
}

Template.teamDetail.contractYearsEditable = function () {
	team = Teams.findOne(Session.get("selectedTeam"));
	if (team) {
		return (team.owner == Meteor.user()._id && this.currentYear == 1 && this.bid > 1) || Roles.userIsInRole(Meteor.user()._id, ['admin']);
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
		return (team.owner == Meteor.user()._id && this.contractYears > 1 && this.bid > 1) || Roles.userIsInRole(Meteor.user()._id, ['admin']);
	}
	return false;
}

Template.teamDetail.currentYearEdit = function () {
	return Session.get("currentYearEdit") == this.player_id;
}

Template.teamDetail.league = function () {
	return Leagues.findOne();
}

Template.teamDetail.getPositionContracts = function (position) {
	var team = Teams.findOne(Session.get("selectedTeam"));
	var contracts = _.map(team.roster, function(contract) {
		var player = Players.findOne(contract.player_id);
		contract.rank = player.rank;
		contract.position = player.position;
		return contract;
	});
	console.log(contracts);
	var contracts = _.filter(contracts, function (contract) {
		return position == contract.position;	
	});
	console.log(contracts);
	return _.sortBy(contracts, function (contract) { return contract.rank });
}

Template.teamDetail.availableContractYears = function () {
	var arr = [];
	var team = Teams.findOne(Session.get("selectedTeam"));
	var fourYearContracts = _.reduce(team.roster, function(memo, contract){
		if (contract.contractYears == 4) {
			return memo + 1
		} else {
			return memo
		}
	}, 0);
	var threeYearContracts = _.reduce(team.roster, function(memo, contract){
		if (contract.contractYears == 3 && contract.bid != 1) {
			return memo + 1
		} else {
			return memo
		}
	}, 0);
	arr.push({year: 1, selected: 1==this.contractYears});
	arr.push({year: 2, selected: 2==this.contractYears});
	if (((threeYearContracts < 2 || this.contractYears == 3) && (this.bid > 3)) || this.bid == 1) {
		arr.push({year: 3, selected: 3==this.contractYears});
	}
	if ((fourYearContracts < 1 || this.contractYears == 4) && this.bid > 3) {
		arr.push({year: 4, selected: 4==this.contractYears});
	}
	return arr;
}

Template.teamDetail.bonusTotal = function() {
	if (this.bid == 1){
		return 0;
	}
	return Math.ceil(this.bid * this.contractYears / 2);
}

Template.teamDetail.salaryTotal = function () {
	if (this.bid == 1){
		return 3;
	}
	return (this.bid * this.contractYears - Math.ceil(this.bid * this.contractYears/2));
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
		var contractYears = parseInt($(event.target).val(), 10);
		if (contractYears == 1) {
			Session.set("editContract", null);
		} else {
			Session.set("editContract", this.player_id);
			Session.set("salaryError", "");
		}
		Meteor.call("updatePlayerContract", Session.get("selectedTeam"), this.player_id, contractYears);
	},
	'click .save-contract': function () {
		var salaryAllocation = []
		for (var i=1; i<=this.contractYears; i++) {
			var bonus = parseInt($('#' + this.player_id + '-year-' + i + '-bonus').val(), 10);
			var salary = parseInt($('#' + this.player_id + '-year-' + i + '-salary').val(), 10);
			salaryAllocation.push({year: i, bonus: bonus, salary: salary});
		}
		if (validateContractAllocation(salaryAllocation, this.bid)) {
			Meteor.call("updateSalaryAllocation", Session.get("selectedTeam"), this.player_id, salaryAllocation);
			Session.set("editContract", null);
		}
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