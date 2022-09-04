import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { Subscriptions } from '../../app/models';

Meteor.methods({
	toggleMute(rid, disableNotifications) {
		check(rid, String);

		check(disableNotifications, Match.Optional(Boolean));
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'toggleMute',
			});
		}

		const userSubscription = Subscriptions.findOneByRoomIdAndUserId(rid, Meteor.userId());
		if (!userSubscription) {
			throw new Meteor.Error('error-invalid-subscription',
				'You must be part of a room to mute it',
				{ method: 'toggleMute' },
			);
		}

		return Subscriptions.setMuteByRoomIdAndUserId(rid, Meteor.userId(), disableNotifications);
	},
});
