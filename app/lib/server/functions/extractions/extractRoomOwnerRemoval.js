import { getRoomDestinations } from '../getRoomDestinations';
import { externalWriter } from '../ExternalWriters';

export const extractRoomOwnerRemoval = (
	subscription,
	fromUser,
	extraData = {}
) => {
	const roomDestinations = getRoomDestinations(subscription.rid);

	if (roomDestinations) {
		const dataToWrite = {
			roomName: subscription.name,
			roomType: subscription.t,
			username: Meteor.user().username,
			name: subscription.u.username
		};

		externalWriter.write(
			roomDestinations,
			externalWriter.helpers.functionsName.REMOVE_OWNER_FROM_ROOM,
			dataToWrite,
			extraData
		);
	}
};
