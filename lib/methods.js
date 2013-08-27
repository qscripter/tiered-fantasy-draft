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
		}
	}
});