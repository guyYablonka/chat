import { Meteor } from 'meteor/meteor';
import { api } from '../../../../server/sdk/api';
import { RocketChatFile } from '../../../file';
import { FileUpload } from '../../../file-upload';
import { Messages, Rooms } from '../../../models/server';

export const setRoomAvatar = function (rid, dataURI, user) {
	const fileStore = FileUpload.getStore('Avatars');

	if (!dataURI) {
		fileStore.deleteByRoomId(rid);
		Messages.createRoomSettingsChangedWithTypeRoomIdMessageAndUser(
			'room_changed_avatar',
			rid,
			'',
			user
		);
		api.broadcast('room.avatarUpdate', { _id: rid });

		return Rooms.unsetAvatarData(rid);
	}

	const fileData = RocketChatFile.dataURIParse(dataURI);

	const buffer = Buffer.from(fileData.image, 'base64');

	const file = {
		rid,
		type: fileData.contentType,
		size: buffer.length,
		uid: user._id
	};

	fileStore.insert(file, buffer, (err, result) => {
		if (err) {
			throw err;
		}

		Meteor.setTimeout(() => {
			Rooms.setAvatarData(rid, 'upload', result.etag);
			Messages.createRoomSettingsChangedWithTypeRoomIdMessageAndUser(
				'room_changed_avatar',
				rid,
				'',
				user
			);
			api.broadcast('room.avatarUpdate', {
				_id: rid,
				avatarETag: result.etag
			});
		}, 500);
	});
};
