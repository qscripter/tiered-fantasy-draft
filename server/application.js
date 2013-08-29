Meteor.startup(function () {
	if (Players.find().fetch().length === 0) {
		for (var i=0; i<nfl_players.length; i++) {
			Players.insert(nfl_players[i]);
		}
	}
	var qscripterId = Meteor.users.findOne({"emails.0.address": "qscripter@gmail.com"})._id;
	Roles.addUsersToRoles(qscripterId, ['admin']);
	//Tiers.remove({}, {multi: true});

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

});