import { Rooms } from '../../../models/server';

export const decDestinationsByRoleChange = (userId, rolesRemoved) => {
	if (rolesRemoved.length) {
		const rooms = Rooms.findBySubscriptionUserId(userId).fetch();

		rooms.forEach(room => {
			rolesRemoved.forEach(role => {
				Rooms.decDestinationsCount(room._id, role, room._updatedAt);
			});
		});
	}
};
