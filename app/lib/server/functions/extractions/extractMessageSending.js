import { getRoomDestinations } from '../getRoomDestinations';
import { externalWriter } from '../ExternalWriters';
import { RoomTypes } from '../../../../utils/server';

export const extractMessageSending = (room, message, extraData = {}) => {
	const messageDestinations = getRoomDestinations(room);

	if (messageDestinations) {
		const dataToWrite = {
			roomNameOrUsernames:
				room.t === RoomTypes.DM ? [...room.usernames] : [room.name],
			roomType: room.t,
			senderUsername: message.u.username,
			content: message.msg,
			attachments: message.attachments,
			msgId: message._id,
			ts: Date.parse(message.ts),
			file: message.file
		};

		externalWriter.write(
			messageDestinations,
			externalWriter.helpers.functionsName.SEND_MESSAGE,
			dataToWrite,
			extraData
		);
	}
};
