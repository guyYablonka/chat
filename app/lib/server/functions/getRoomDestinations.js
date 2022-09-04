import _ from 'underscore';
import { Rooms } from '../../../models';
import { RoomTypes } from '../../../utils';

export const getRoomDestinations = function (roomOrRoomId) {
	const room =
		typeof roomOrRoomId === 'object'
			? roomOrRoomId
			: Rooms.findOneByIdOrName(roomOrRoomId);

	if (room.t === RoomTypes.CHANNEL) {
		return;
	}

	const roomDestinations = room.destinations || {};

	Object.keys(roomDestinations).forEach(destination => {
		if (roomDestinations[destination] <= 0) {
			delete roomDestinations[destination];
		}
	});

	return !_.isEmpty(roomDestinations) && roomDestinations;
};
