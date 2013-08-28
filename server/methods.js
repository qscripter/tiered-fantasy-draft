Meteor.methods({
	updatePlayerSalary: function (teamId, playerId, salary) {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			salary = parseInt(salary, 10);
			Teams.update({
				_id: teamId,
				"roster.player_id": playerId
			},
			{$set: {'roster.$.salary': salary}});
		}
	},
	updatePlayerContract: function (teamId, playerId, contractYears) {
		if (Roles.userIsInRole(this.userId, ['admin'])) {
			contractYears = parseInt(contractYears, 10);
			Teams.update({
				_id: teamId,
				"roster.player_id": playerId
			},
			{$set: {'roster.$.contractYears': contractYears}});
		}
	},
	submitBids: function (tierId, maxPlayers, bids) {
		// make sure the bids are being entered for the active round
		var tier = Tiers.findOne(tierId);
		var team = Teams.findOne({owner: this.userId});
		if (tier && tier.active && team) {
			// create bid objects for players
			_.each(bids, function (bid) {
				var data = {
					team: team._id,
					player: bid.player_id,
					bid: bid.bid
				};
				Bids.insert(data);
			});
			// mark player bids as submitted within the Tier
			var submission = {
				team: team._id,
				maxPlayers: maxPlayers
			};
			Tiers.update(tierId, {$push: {submissions: submission}});
		}
	}
});