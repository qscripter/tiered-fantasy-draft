Meteor.methods({
	updatePlayerSalary: function (teamId, playerId, salary) {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			salary = parseInt(salary, 10);
			Teams.update({
				_id: teamId,
				"roster.player_id": playerId
			},
			{$set: {'roster.$.salary': salary}});
		}
	},
	updatePlayerContract: function (teamId, playerId, contractYears) {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			contractYears = parseInt(contractYears, 10);
			Teams.update({
				_id: teamId,
				"roster.player_id": playerId
			},
			{$set: {'roster.$.contractYears': contractYears}});
		}
	}
});