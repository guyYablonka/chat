import { API } from '../../api';
import { Meteor } from 'meteor/meteor';
import { Rooms } from '../../../../models';

API.helperMethods.set('getOldSelfDM', function _getOldSelfDM(roomId) {
	let room;
	const halfLength = roomId.length / 2;

	const firstHalf = roomId.substr(0, halfLength);
	const secondHalf = roomId.substr(halfLength);

	if (firstHalf === secondHalf) {
		room = Rooms.findOneDirectRoomContainingAllUserIDs([firstHalf]);
	}

	return room?._id;
});
