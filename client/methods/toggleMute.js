import { Meteor } from 'meteor/meteor';

import { ChatSubscription } from '../../app/models';

Meteor.methods({
	toggleMute(rid, disableNotifications) {
		if (!Meteor.userId()) {
			return false;
		}

		ChatSubscription.update({
			rid,
			'u._id': Meteor.userId(),
		}, {
			$set: {
				disableNotifications,
			},
		});
	},
});
