import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { markRoomAsRead } from '../lib/markRoomAsRead';
import { canAccessRoom } from '../../app/authorization/server';
import { Rooms } from '../../app/models/server';
import { extractMarkingRoomAsRead } from '/app/lib/server/functions/extractions/extractMarkingRoomAsRead';

Meteor.methods({
	async readMessages(rid, extraData = {}) {
		check(rid, String);

		const userId = Meteor.userId();
		if (!userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'readMessages'
			});
		}

		const user = Meteor.user();
		const room = Rooms.findOneById(rid);
		if (!canAccessRoom(room, user)) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'readMessages'
			});
		}

		await markRoomAsRead(rid, userId);

		extractMarkingRoomAsRead(room, user.username, extraData);
	}
});
