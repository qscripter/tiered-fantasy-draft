Meteor.methods({
	addPlayerToTeam: function (playerName, teamId) {
		var player = Players.findOne({name: playerName});
		// make sure player exists
		if (player) {
			// check to see if player is owned by another team
			if (Teams.find({'roster.player_id': player._id}).count() === 0) {
				var data = {
					player_id: player._id,
					salary: 1,
					contractYears: 1
				};
				Teams.update(teamId, {$addToSet: {roster: data}});
			} else {
				console.log("player already on another team");
			}
		} else {
			console.log("no such player");
		}
	},
	addPlayerToTier: function (playerName, tierId) {
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
	},
	removePlayerFromTier: function (playerId, tierId) {
		Tiers.update(tierId, {$pull: {players: playerId}});
	}
});