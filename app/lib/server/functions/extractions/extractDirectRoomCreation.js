import { getRoomDestinations } from '../getRoomDestinations';
import { externalWriter } from '../ExternalWriters';
import { Rooms } from '../../../../models';

export const extractDirectRoomCreation = (roomOrRoomId, extraData = {}) => {
	const room =
		typeof roomOrRoomId === 'object'
			? roomOrRoomId
			: Rooms.findOneByIdOrName(roomOrRoomId);

	const dmDestinations = getRoomDestinations(room);

	if (dmDestinations) {
		dataToWrite = {
			usernames: room.usernames,
			roomType: room.t
		};

		externalWriter.write(
			dmDestinations,
			externalWriter.helpers.functionsName.CREATE_DM,
			dataToWrite,
			extraData
		);
	}
};
