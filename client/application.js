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

////////////////
// BeforeHooks
////////////////
// I use an object that contains all before hooks
var IR_BeforeHooks = {
    isLoggedIn: function(pause) {
        if (!(Meteor.loggingIn() || Meteor.user())) {
          //Notify.setError(__('Please login.'));
          this.render('login');
          pause();
        }
    }
    // add more before hooks here
}

// (Global) Before hooks for any route
Router.onBeforeAction(IR_BeforeHooks.isLoggedIn);

Router.configure({
	layoutTemplate: 'layoutTemplate',
	loadingTemplate: 'loading'
})

//Routes
Router.map(function() {
	this.route('main', {
		path: '/',
		template: 'tiers',
	});
	this.route('tierDetail', {
		path: '/tiers/:_id',
		template: 'tierDetail',
		waitOn: function () {
			Session.set('selectedTier', this.params._id);
			return Meteor.subscribe('players');
		},
		action: function() {
			if (this.ready())
				this.render();
			else
				this.render('loading');
		}
	});
	this.route('tiers', {
		path: '/tiers',
		template: 'tiers',
	});
	this.route('teamDetail', {
		path: '/teams/:_id',
		template: 'teamDetail',
		data: function() {
			return Teams.findOne(this.params._id);
		},
		waitOn: function () {
			Session.set('selectedTeam', this.params._id);
			return Meteor.subscribe("players");
		},
		action: function() {
			if (this.ready())
				this.render();
			else
				this.render('loading');
		}
	});
	this.route('teams', {
		path: '/teams',
		template: 'teams',
	});
	this.route('myTeam', {
		path: '/my-team',
		waitOn: function () {
			return Meteor.subscribe("teams");
		},
		action: function() {
			if (this.ready()) {
				var team = Teams.findOne({owner: Meteor.user()._id});
				this.redirect('/teams/' + team._id);
			} else
				this.render('loading');
		}
	});
	this.route('players',{
		path: '/players',
		template: 'players'
	});
	this.route('currentTier', {
		path: '/current-tier',
		waitOn: function () {
			return Meteor.subscribe("tiers");
		},
		action: function () {
			if (this.ready()) {
				var tier = Tiers.findOne({active: true});
				Session.set('selectedTier', tier._id);
				this.render('tierDetail');
			} else
				this.render('loading');
		}
	});
});

// Meteor.Router.filters({
// 	'checkLoggedIn': function (page) {
// 		if (Meteor.loggingIn()) {
// 			return 'loading';
// 		} else if (Meteor.user()) {
// 			return page;
// 		} else {
// 			return 'signIn';
// 		}
// 	}
// });

// // apply the checkLoggedIn filter to all pages
// Meteor.Router.filter('checkLoggedIn');