import { Meteor } from 'meteor/meteor';
import _ from 'underscore';
import { check } from 'meteor/check';
import { Uploads } from '../../../models';

Meteor.methods({
	async addRoomToForwardList(roomsList, fileId) {
		check(roomsList, Array);
		check(fileId, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'addRoomToForwardList'
			});
		}

		const chosenFile = Uploads.findOneById(fileId);
		const { rid, forwardedRooms } = chosenFile;

		const sentFileRooms = [rid, ...forwardedRooms];

		const canAccessFileRoom = Meteor.call(
			'canAccessRooms',
			sentFileRooms,
			false,
			Meteor.userId()
		);
		const canAccessAllGivenRooms = Meteor.call(
			'canAccessRooms',
			roomsList,
			true,
			Meteor.userId()
		);

		if (!canAccessFileRoom) {
			throw new Meteor.Error('error-cant-access-file-rooms', 'not-in-rooms', {
				method: 'addRoomToForwardList'
			});
		}

		if (!canAccessAllGivenRooms) {
			throw new Meteor.Error('error-cant-access-given-rooms', 'not-in-rooms', {
				method: 'addRoomToForwardList'
			});
		}

		Uploads.addRoomToForwardList(roomsList, fileId);
	}
});
