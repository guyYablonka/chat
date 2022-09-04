import { Meteor } from 'meteor/meteor';
import { hasPermission } from '../../app/authorization';
import { Subscriptions } from '../../app/models';

Meteor.methods({
	getMemberColorDictionaryForRoom(rid) {
		const userId = Meteor.userId();
		if (!userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'getMemberColorDictionaryForRoom'
			});
		}

		const room = Meteor.call('canAccessRoom', rid, userId);
		if (!room) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', {
				method: 'getMemberColorDictionaryForRoom'
			});
		}

		if (
			room.broadcast &&
			!hasPermission(userId, 'view-broadcast-member-list', rid)
		) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'getMemberColorDictionaryForRoom'
			});
		}

		const subscriptions = Subscriptions.findByRoomIdWhenUsernameExists(rid, {
			fields: { 'u._id': 1, color: 1 }
		}).fetch();

		const userColorDict = {};

		subscriptions.forEach(sub => {
			userColorDict[sub.u._id] = sub.color;
		});

		return userColorDict;
	}
});
