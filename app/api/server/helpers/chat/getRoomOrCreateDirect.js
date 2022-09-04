import findRoomByIdOrName from '../../utils/findRoomByIdOrName';

import { API } from '../../api';
import { Meteor } from 'meteor/meteor';
import { settings } from '../../../../settings';

API.helperMethods.set(
	'getRoomOrCreateDirect',
	function _getRoomOrCreateDirect(params, fromUser) {
		let room = null;

		if (params.roomId || params.roomName) {
			room = findRoomByIdOrName({ params });
		} else if (params.targetUsername) {
			Meteor.runAsUser(fromUser._id, () => {
				room = Meteor.call(
					'findDirectMessageOrCreate',
					params.targetUsername
				);
			});
		}

		if (!room) {
			throw new Meteor.Error(
				'error-invalid-roomId',
				`room ${
					params.roomId || params.roomName || params.targetUsername
				} does not exist.`
			);
		}
		if (!Meteor.call('canAccessRoom', room.rid || room._id, fromUser._id)) {
			throw new Meteor.Error(
				'error-no-access',
				`User ${fromUser.username} is not in room ${room.name}.`
			);
		}

		return room;
	}
);
