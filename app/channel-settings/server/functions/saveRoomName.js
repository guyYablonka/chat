import { Meteor } from 'meteor/meteor';

import { Rooms, Messages, Subscriptions, Integrations } from '../../../models';
import { roomTypes, getValidRoomName } from '../../../utils';
import { callbacks } from '../../../callbacks';
import { extractRoomNameUpdate } from '../../../lib/server/functions/extractions/extractRoomNameUpdate';

const updateRoomName = (rid, displayName, isDiscussion, extraData = {}) => {
	if (isDiscussion) {
		return (
			Rooms.setFnameById(rid, displayName) &&
			Subscriptions.updateFnameByRoomId(rid, displayName)
		);
	}
	const slugifiedRoomName = getValidRoomName(displayName, rid);
	const queryResult =
		Rooms.setNameById(rid, slugifiedRoomName, displayName) &&
		Subscriptions.updateNameAndAlertByRoomId(
			rid,
			slugifiedRoomName,
			displayName
		);

	extractRoomNameUpdate(rid, extraData.room.name, displayName, extraData);

	return queryResult;
};

export const saveRoomName = function (
	rid,
	displayName,
	user,
	sendMessage = true,
	extraData = {}
) {
	const room = Rooms.findOneById(rid);
	if (roomTypes.getConfig(room.t).preventRenaming()) {
		throw new Meteor.Error('error-not-allowed', 'Not allowed', {
			function: 'RocketChat.saveRoomdisplayName'
		});
	}
	if (displayName === room.name) {
		return;
	}
	const isDiscussion = Boolean(room && room.prid);

	extraData.room = room;
	const update = updateRoomName(rid, displayName, isDiscussion, extraData);
	if (!update) {
		return;
	}
	Integrations.updateRoomName(room.name, displayName);
	if (sendMessage) {
		Messages.createRoomRenamedWithRoomIdRoomNameAndUser(
			rid,
			displayName,
			user
		);
	}
	callbacks.run('afterRoomNameChange', {
		rid,
		name: displayName,
		oldName: room.name
	});
	return displayName;
};
