import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { settings } from '../../app/settings';
import { hasPermission } from '../../app/authorization';
import { Users, Rooms } from '../../app/models';
import { RateLimiter } from '../../app/lib';
import { addUser } from '../../app/federation/server/functions/addUser';
import { createRoom } from '../../app/lib/server';

Meteor.methods({
	findDirectMessageOrCreate(targetUsername) {
		check(targetUsername, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error(
				'error-invalid-origin-user',
				'Invalid user',
				{
					method: 'findDirectMessageOrCreate'
				}
			);
		}
		const me = Meteor.user();

		if (!me.username) {
			throw new Meteor.Error(
				'error-invalid-origin-user',
				'Invalid user',
				{
					method: 'findDirectMessageOrCreate'
				}
			);
		}
		const targetUser = Users.findOneByUsernameOrEmail(targetUsername);

		if (!targetUser) {
			throw new Meteor.Error(
				'error-invalid-target-user',
				'Invalid user',
				{
					method: 'findDirectMessageOrCreate'
				}
			);
		}

		let room = Rooms.findOneDirectRoomContainingAllUserIDs([
			me._id,
			targetUser._id
		]);
		let roomToReturn = room;

		// We need to create a new direct message
		if (!room) {
			room = Meteor.call('createDirectMessage', targetUsername);
			roomToReturn = Rooms.findOneById(room.rid);
		}
		return roomToReturn;
	}
});
