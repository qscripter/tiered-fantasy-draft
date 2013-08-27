//Routes
Meteor.Router.add({
	'/': 'main',
	'/tiers/:id': function (id) {
		Session.set("currentTier", id);
		return 'tiers';
	},
	'/teams/:id': function (id) {
		Session.set("selectedTeam", id);
		return 'teams';
	}
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