import { Meteor } from 'meteor/meteor';

import { Rooms, Messages, Subscriptions } from '../../../models';
import { callbacks } from '../../../callbacks';
import { getUserDestinations } from './getUserDestinations';
import { extractRoomMemberLeaving } from './extractions/extractRoomMemberLeaving';

export const removeUserFromRoom = function (
	rid,
	user,
	options = {},
	extraData = {}
) {
	const room = Rooms.findOneById(rid);

	if (room) {
		const userDestinations = getUserDestinations(user.username);

		for (dest of Object.keys(userDestinations)) {
			Rooms.decDestinationsCount(room._id, dest, room._updatedAt);
		}

		callbacks.run('beforeLeaveRoom', user, room);

		const subscription = Subscriptions.findOneByRoomIdAndUserId(
			rid,
			user._id,
			{
				fields: { _id: 1 }
			}
		);

		if (subscription) {
			const removedUser = user;
			if (options.byUser) {
				Messages.createUserRemovedWithRoomIdAndUser(rid, user, {
					u: options.byUser
				});
			} else {
				Messages.createUserLeaveWithRoomIdAndUser(rid, removedUser);
			}
		}

		if (room.t === 'l') {
			Messages.createCommandWithRoomIdAndUser('survey', rid, user);
		}

		Subscriptions.removeByRoomIdAndUserId(rid, user._id);

		extractRoomMemberLeaving(room, user, extraData);

		Meteor.defer(function () {
			// TODO: CACHE: maybe a queue?
			callbacks.run('afterLeaveRoom', user, room);
		});
	}
};
