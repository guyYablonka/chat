import { getSubscriptionDestinations } from '../getSubscriptionDestinations';
import { externalWriter } from '../ExternalWriters';

export const extractRoomMemberLeaving = (room, user, extraData = {}) => {
	const subDestinations = getSubscriptionDestinations(
		user.username,
		room._id
	);

	if (subDestinations) {
		const dataToWrite = {
			roomName: room.name,
			roomType: room.t,
			username: Meteor.user().username,
			name: user.username
		};

		externalWriter.write(
			subDestinations,
			externalWriter.helpers.functionsName.USER_LEAVE,
			dataToWrite,
			extraData
		);
	}
};
