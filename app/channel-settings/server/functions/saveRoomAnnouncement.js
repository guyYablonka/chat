import { Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Messages, Rooms } from '../../../models';

export const saveRoomAnnouncement = function (
	rid,
	roomAnnouncement,
	user,
	sendMessage = true
) {
	if (!Match.test(rid, String)) {
		throw new Meteor.Error('invalid-room', 'Invalid room', {
			function: 'RocketChat.saveRoomAnnouncement'
		});
	}

	let message;
	let announcementDetails;
	if (typeof roomAnnouncement === 'string') {
		message = roomAnnouncement;
	} else {
		({ message, ...announcementDetails } = roomAnnouncement);
	}

	const updated = Rooms.setAnnouncementById(
		rid,
		message,
		announcementDetails
	);

	if (updated && sendMessage) {
		Messages.createChangeAnnouncementWithRoomIdAndUser(rid, user, message);
	}

	return updated;
};
