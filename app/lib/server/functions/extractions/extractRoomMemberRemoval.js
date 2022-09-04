import { externalWriter } from '../ExternalWriters';
import { getSubscriptionDestinations } from '../getSubscriptionDestinations';

export const extractRoomMemberRemoval = (
	room,
	removedUser,
	fromUser,
	extraData = {}
) => {
	const subDestinations = getSubscriptionDestinations(
		removedUser.username,
		room._id
	);

	if (subDestinations) {
		const dataToWrite = {
			roomName: room.name,
			roomType: room.t,
			username: Meteor.user().username,
			name: removedUser.username
		};

		externalWriter.write(
			subDestinations,
			externalWriter.helpers.functionsName.REMOVE_MEMBER_FROM_ROOM,
			dataToWrite,
			extraData
		);
	}
};
