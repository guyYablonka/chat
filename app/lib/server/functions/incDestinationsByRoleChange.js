import { Rooms } from '../../../models/server';
import { RoomTypes } from '../../../utils/server';
import { extractRoomCreation, extractDirectRoomCreation } from './extractions';

export const incDestinationsByRoleChange = (userId, rolesAdded) => {
	if (rolesAdded.length) {
		const roomsBefore = Rooms.findBySubscriptionUserId(userId).fetch();

		roomsBefore.forEach(roomBefore => {
			rolesAdded.forEach(role => {
				Rooms.incDestinationsCount(
					roomBefore._id,
					role,
					roomBefore._updatedAt
				);

				if (
					!roomBefore.destinations ||
					!roomBefore.destinations[role]
				) {
					if (roomBefore.t === RoomTypes.DM) {
						extractDirectRoomCreation(roomBefore._id);
					} else {
						extractRoomCreation(roomBefore._id);
					}
				}
			});
		});
	}
};
