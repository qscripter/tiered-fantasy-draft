Meteor.startup(function () {
	if (Players.find().fetch().length === 0) {
		for (var i=0; i<nfl_players.length; i++) {
			Players.insert(nfl_players[i]);
		}
	}
});