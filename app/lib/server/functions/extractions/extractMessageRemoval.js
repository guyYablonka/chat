import { getRoomDestinations } from '../getRoomDestinations';
import { externalWriter } from '../ExternalWriters';
import { RoomTypes } from '../../../../utils/server';

export const extractMessageRemoval = (room, message, extraData = {}) => {
	const messageDestinations = getRoomDestinations(room);

	if (messageDestinations) {
		const dataToWrite = {
			roomNameOrUsernames:
				room.t === RoomTypes.DM ? [...room.usernames] : [room.name],
			senderUsername: message.u.username,
			content: message.msg,
			roomType: room.t,
			ts: Date.parse(message.ts)
		};

		externalWriter.write(
			messageDestinations,
			externalWriter.helpers.functionsName.REMOVE_MESSAGE,
			dataToWrite,
			extraData
		);
	}
};
