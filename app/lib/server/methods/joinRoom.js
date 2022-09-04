import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { canAccessRoom } from '../../../authorization';
import { Rooms } from '../../../models';
import { addUserToRoom } from '../functions';
import { roomTypes, RoomMemberActions } from '../../../utils/server';

Meteor.methods({
	joinRoom(rid) {
		check(rid, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'joinRoom'
			});
		}

		const room = Rooms.findOneById(rid);

		if (!room) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', {
				method: 'joinRoom'
			});
		}

		if (
			!roomTypes
				.getConfig(room.t)
				.allowMemberAction(room, RoomMemberActions.JOIN)
		) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'joinRoom'
			});
		}

		// TODO we should have a 'beforeJoinRoom' call back so external services can do their own validations
		const user = Meteor.user();
		if (!canAccessRoom(room, Meteor.user())) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'joinRoom'
			});
		}

		return addUserToRoom(rid, user);
	}
});
