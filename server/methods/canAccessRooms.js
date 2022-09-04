import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { Users, Rooms } from '../../app/models/server';
Meteor.methods({
	canAccessRooms(roomsList, shouldAccessAll, userId, extraData) {
		check(roomsList, Array);
		check(userId, String);
		check(shouldAccessAll, Boolean);

		const user = Users.findOneById(userId, {
			fields: {
				username: 1
			}
		});

		if (!user || !user.username) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'canAccessRooms'
			});
		}

		if (!roomsList) {
			throw new Meteor.Error('error-invalid-rooms', 'Invalid rooms', {
				method: 'canAccessRooms'
			});
		}

		// Defined false, if one of rooms matches it would change to true
		let canAccessOneOfRooms = false;

		// Defined true, if one room doesn't match it would change to false
		let canAccessAllRooms = true;

		const rooms = Rooms.find({ _id: { $in: roomsList } }).fetch();

		if (rooms.length !== roomsList.length) {
			throw new Meteor.Error('error-invalid-rooms', 'Invalid rooms', {
				method: 'canAccessRooms'
			});
		}

		rooms.forEach(roomObj => {
			if (Meteor.call('canAccessRoom', roomObj._id, user._id, extraData)) {
				canAccessOneOfRooms = true;
			} else {
				canAccessAllRooms = false;
			}
		});

		if (shouldAccessAll) {
			return canAccessAllRooms;
		} else {
			return canAccessOneOfRooms;
		}
	}
});
