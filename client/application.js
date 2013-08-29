Meteor.subscribe("users");
Meteor.subscribe("tiers");
Meteor.subscribe("teams", function () {
	var team = Teams.findOne({owner: Meteor.userId()});
	if (team) {
		Session.set("selectedSidebarTeam", team._id);
	}
});
Meteor.subscribe("players");
Meteor.subscribe("bids");
Meteor.subscribe("leagues");

//Routes
Meteor.Router.add({
	'/': 'main',
	'/tiers/:id': function (id) {
		Session.set("selectedTier", id);
		return 'tierDetail';
	},
	'/tiers': 'tiers',
	'/teams/:id': function (id) {
		Session.set("selectedTeam", id);
		return 'teamDetail';
	},
	'/teams': 'teams'
});

Meteor.Router.filters({
	'checkLoggedIn': function (page) {
		if (Meteor.loggingIn()) {
			return 'loading';
		} else if (Meteor.user()) {
			return page;
		} else {
			return 'signIn';
		}
	}
});

// apply the checkLoggedIn filter to all pages
Meteor.Router.filter('checkLoggedIn');