Meteor.publish("users", function () {
	return Meteor.users.find({}, {fields: {'emails': 1, 'profile': 1, 'username': 1}});
});

Meteor.publish("teams", function () {
	return Teams.find();
});

Meteor.publish("players", function () {
	return Players.find();
});

Meteor.publish("tiers", function () {
	return Tiers.find();
});