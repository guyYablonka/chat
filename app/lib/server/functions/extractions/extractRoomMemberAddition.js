import { getSubscriptionDestinations } from '../getSubscriptionDestinations';
import { externalWriter } from '../ExternalWriters';

export const extractRoomMemberAddition = (room, user, extraData) => {
	const subDestinations = getSubscriptionDestinations(
		user.username,
		room._id
	);

	if (subDestinations) {
		const dataToWrite = {
			roomId: room._id,
			roomName: room.name,
			roomType: room.t,
			username: Meteor.user().username,
			name: user.username
		};

		externalWriter.write(
			subDestinations,
			externalWriter.helpers.functionsName.ADD_MEMBER_TO_ROOM,
			dataToWrite,
			extraData
		);
	}
};
