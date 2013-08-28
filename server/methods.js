Meteor.methods({
	updatePlayerSalary: function (teamId, playerId, salary) {
		salary = parseInt(salary, 10);
		Teams.update({
			_id: teamId,
			"roster.player_id": playerId
		},
		{$set: {'roster.$.salary': salary}});
	},
	updatePlayerContract: function (teamId, playerId, contractYears) {
		contractYears = parseInt(contractYears, 10);
		Teams.update({
			_id: teamId,
			"roster.player_id": playerId
		},
		{$set: {'roster.$.contractYears': contractYears}});
	}
});