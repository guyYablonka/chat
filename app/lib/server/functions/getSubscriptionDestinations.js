import _ from 'underscore';
import { getDestinations } from './getDestinations';
import { Subscriptions, Rooms } from '../../../models';
import { RoomTypes } from '../../../utils';

export const getSubscriptionDestinations = function (username, rid) {
	const roomType = Rooms.getTypeByIdOrName(rid);

	if (roomType === RoomTypes.CHANNEL) {
		return;
	}

	const usernamesInRoom = Subscriptions.findByRoomId(rid)
		.fetch()
		.map(sub => sub.u.username);

	if (!usernamesInRoom.includes(username)) {
		usernamesInRoom.push(username);
	}

	const subDestinations = getDestinations(usernamesInRoom) || {};

	return !_.isEmpty(subDestinations) && subDestinations;
};
