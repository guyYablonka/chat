import { API } from '../api';
import { Rooms } from '../../../models';

const findRoomByIdOrName = ({ params, checkedArchived = true }) => {
	if (
		(!params.roomId || !params.roomId.trim()) &&
		(!params.roomName || !params.roomName.trim())
	) {
		throw new Meteor.Error(
			'error-roomid-param-not-provided',
			'The parameter "roomId" or "roomName" is required'
		);
	}

	const fields = { ...API.v1.defaultFieldsToExclude };

	let room;
	if (params.roomId) {
		room = Rooms.findOneById(params.roomId, { fields });
	} else if (params.roomName) {
		room = Rooms.findOneByName(params.roomName, { fields });
	}
	if (!room) {
		throw new Meteor.Error(
			'error-room-not-found',
			'The required "roomId" or "roomName" param provided does not match any channel'
		);
	}
	if (checkedArchived && room.archived) {
		throw new Meteor.Error(
			'error-room-archived',
			`The channel, ${room.name}, is archived`
		);
	}

	return room;
};

export default findRoomByIdOrName;
