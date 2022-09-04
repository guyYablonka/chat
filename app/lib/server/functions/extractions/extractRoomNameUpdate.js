import { getRoomDestinations } from '../getRoomDestinations';
import { externalWriter } from '../ExternalWriters';

export const extractRoomNameUpdate = (
	rid,
	oldName,
	newName,
	extraData = {}
) => {
	const roomDestinations = getRoomDestinations(rid);

	if (roomDestinations) {
		const { room } = extraData;

		const dataToWrite = {
			oldRoomName: oldName,
			name: newName,
			roomType: room.t,
			username: Meteor.user().username
		};

		externalWriter.write(
			roomDestinations,
			externalWriter.helpers.functionsName.UPDATE_ROOM_NAME,
			dataToWrite,
			extraData
		);
	}
};
