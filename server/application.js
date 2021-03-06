Meteor.startup(function () {
	
	var qscripter = Meteor.users.findOne({"emails.0.address": "qscripter@gmail.com"});
	if (qscripter) {
		Roles.addUsersToRoles(qscripter._id, ['admin']);
	}

	if (Leagues.find().count() === 0) {
		var data = {
			cap: 100,
			minBid: 2,
			positions: [
				{position: 'QB', required: 1},
				{position: 'RB', required: 1},
				{position: 'WR', required: 2},
				{position: 'TE', required: 1},
				{position: 'K', required: 1},
				{position: 'D', required: 1},
				{position: 'ST', required: 1}
			],
			maxRosterSize: 19,
			minRosterSize: 17
		};
		Leagues.insert(data);
	}

	// TODO: create 2015 players list, assign to nfl_players var
	_.each(nfl_players, function(player) {
		var mongoRecord = Players.findOne({name: player.name});
		if (mongoRecord) {
			Players.update(mongoRecord._id, {$set: {team: player.team, bye: player.bye}});
		} else {
			Players.insert(player);
		}
	});

});