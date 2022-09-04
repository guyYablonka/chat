import { getRoomDestinations } from '../getRoomDestinations';
import { externalWriter } from '../ExternalWriters';
import { Rooms } from '../../../../models';

export const extractRoomCreation = (roomOrRoomId, extraData = {}) => {
	const room =
		typeof roomOrRoomId === 'object'
			? roomOrRoomId
			: Rooms.findOneByIdOrName(roomOrRoomId);

	const roomDestinations = getRoomDestinations(room);

	if (roomDestinations) {
		const dataToWrite = {
			name: room.name,
			id: room._id,
			creatorUsername: Meteor.user().username,
			roomType: room.t
		};

		externalWriter.write(
			roomDestinations,
			externalWriter.helpers.functionsName.CREATE_ROOM,
			dataToWrite,
			extraData
		);
	}
};
