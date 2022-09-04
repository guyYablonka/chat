import { getRoomDestinations } from '../getRoomDestinations';
import { externalWriter } from '../ExternalWriters';
import { RoomTypes } from '../../../../utils/server';

export const extractMarkingRoomAsRead = (
	room,
	senderUsername,
	extraData = {}
) => {
	const roomDestinations = getRoomDestinations(room);

	if (roomDestinations) {
		const dataToWrite = {
			roomNameOrUsernames:
				room.t === RoomTypes.DM ? [...room.usernames] : [room.name],
			senderUsername,
			roomType: room.t
		};

		externalWriter.write(
			roomDestinations,
			externalWriter.helpers.functionsName.MARK_ROOM_AS_READ,
			dataToWrite,
			extraData
		);
	}
};
