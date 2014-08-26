Meteor.methods({
	addPlayerToTeam: function (playerName, teamId) {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			var player = Players.findOne({name: playerName});
			// make sure player exists
			if (player) {
				// check to see if player is owned by another team
				if (Teams.find({'roster.player_id': player._id}).count() === 0) {
					var data = {
						player_id: player._id,
						bid: 2,
						contractYears: 1,
						currentYear: 1,
						salaryAllocation: [
							{year: 1, salary: 1, bonus: 1}
						],
						rookie: false
					};
					Teams.update(teamId, {$addToSet: {roster: data}});
				} else {
					console.log("player already on another team");
				}
			} else {
				console.log("no such player");
			}
		}
	},
	removePlayerFromTeam: function (playerId, teamId) {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			Teams.update(teamId, {$pull: {roster: {player_id: playerId}}});
		}
	},
	addPlayerToTier: function (playerName, tierId) {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			var player = Players.findOne({name: playerName});
			if (player) {
				if (Tiers.find({players: player._id}).count() === 0) {
					Tiers.update(tierId, {$addToSet: {players: player._id}});
				} else {
					console.log("player already in another tier");
				}
			} else {
				console.log("no such player");
			}
		}
	},
	removePlayerFromTier: function (playerId, tierId) {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			Tiers.update(tierId, {$pull: {players: playerId}});
		}
	},
	setActiveTier: function (tierId) {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			Tiers.update({active: true}, {$set: {active: false}}, {multi: true});
			Tiers.update(tierId, {$set: {active: true}});
		}
	}
});