import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { hasPermission } from '../../../authorization';
import { callbacks } from '../../../callbacks';
import { setRoomAvatar } from '../../../lib/server/functions/setRoomAvatar';
import { Rooms } from '../../../models';
import { RoomSettingsEnum, roomTypes } from '../../../utils';
import { saveReactWhenReadOnly } from '../functions/saveReactWhenReadOnly';
import { saveRoomAnnouncement } from '../functions/saveRoomAnnouncement';
import { saveRoomCustomFields } from '../functions/saveRoomCustomFields';
import { saveRoomDescription } from '../functions/saveRoomDescription';
import { saveRoomEncrypted } from '../functions/saveRoomEncrypted';
import { saveRoomName } from '../functions/saveRoomName';
import { saveRoomReadOnly } from '../functions/saveRoomReadOnly';
import { saveRoomSystemMessages } from '../functions/saveRoomSystemMessages';
import { saveRoomTokenpass } from '../functions/saveRoomTokens';
import { saveRoomTopic } from '../functions/saveRoomTopic';
import { saveRoomType } from '../functions/saveRoomType';
import { saveStreamingOptions } from '../functions/saveStreamingOptions';
const fields = [
	'roomAvatar',
	'featured',
	'roomName',
	'roomTopic',
	'roomAnnouncement',
	'roomCustomFields',
	'roomDescription',
	'roomType',
	'readOnly',
	'reactWhenReadOnly',
	'systemMessages',
	'default',
	'tokenpass',
	'streamingOptions',
	'retentionEnabled',
	'retentionMaxAge',
	'retentionExcludePinned',
	'retentionFilesOnly',
	'retentionIgnoreThreads',
	'retentionOverrideGlobal',
	'encrypted',
	'favorite'
];

const validators = {
	default({ userId }) {
		if (!hasPermission(userId, 'view-room-administration')) {
			throw new Meteor.Error(
				'error-action-not-allowed',
				'Viewing room administration is not allowed',
				{
					method: 'saveRoomSettings',
					action: 'Viewing_room_administration'
				}
			);
		}
	},
	featured({ userId }) {
		if (!hasPermission(userId, 'view-room-administration')) {
			throw new Meteor.Error(
				'error-action-not-allowed',
				'Viewing room administration is not allowed',
				{
					method: 'saveRoomSettings',
					action: 'Viewing_room_administration'
				}
			);
		}
	},
	roomType({ userId, room, value }) {
		if (value === room.t) {
			return;
		}

		if (value === 'c' && !hasPermission(userId, 'create-c')) {
			throw new Meteor.Error(
				'error-action-not-allowed',
				'Changing a private group to a public channel is not allowed',
				{
					method: 'saveRoomSettings',
					action: 'Change_Room_Type'
				}
			);
		}

		if (value === 'p' && !hasPermission(userId, 'create-p')) {
			throw new Meteor.Error(
				'error-action-not-allowed',
				'Changing a public channel to a private room is not allowed',
				{
					method: 'saveRoomSettings',
					action: 'Change_Room_Type'
				}
			);
		}
	},
	encrypted({ userId, value, room, rid }) {
		if (value !== room.encrypted) {
			if (
				!roomTypes
					.getConfig(room.t)
					.allowRoomSettingChange(room, RoomSettingsEnum.E2E)
			) {
				throw new Meteor.Error(
					'error-action-not-allowed',
					'Only groups or direct channels can enable encryption',
					{
						method: 'saveRoomSettings',
						action: 'Change_Room_Encrypted'
					}
				);
			}

			if (
				room.t !== 'd' &&
				!hasPermission(userId, 'toggle-room-e2e-encryption', rid)
			) {
				throw new Meteor.Error(
					'error-action-not-allowed',
					'You do not have permission to toggle E2E encryption',
					{
						method: 'saveRoomSettings',
						action: 'Change_Room_Encrypted'
					}
				);
			}
		}
	},
	retentionEnabled({ userId, value, room, rid }) {
		if (
			!hasPermission(userId, 'edit-room-retention-policy', rid) &&
			value !== room.retention.enabled
		) {
			throw new Meteor.Error(
				'error-action-not-allowed',
				'Editing room retention policy is not allowed',
				{
					method: 'saveRoomSettings',
					action: 'Editing_room'
				}
			);
		}
	},
	retentionMaxAge({ userId, value, room, rid }) {
		if (
			!hasPermission(userId, 'edit-room-retention-policy', rid) &&
			value !== room.retention.maxAge
		) {
			throw new Meteor.Error(
				'error-action-not-allowed',
				'Editing room retention policy is not allowed',
				{
					method: 'saveRoomSettings',
					action: 'Editing_room'
				}
			);
		}
	},
	retentionExcludePinned({ userId, value, room, rid }) {
		if (
			!hasPermission(userId, 'edit-room-retention-policy', rid) &&
			value !== room.retention.excludePinned
		) {
			throw new Meteor.Error(
				'error-action-not-allowed',
				'Editing room retention policy is not allowed',
				{
					method: 'saveRoomSettings',
					action: 'Editing_room'
				}
			);
		}
	},
	retentionFilesOnly({ userId, value, room, rid }) {
		if (
			!hasPermission(userId, 'edit-room-retention-policy', rid) &&
			value !== room.retention.filesOnly
		) {
			throw new Meteor.Error(
				'error-action-not-allowed',
				'Editing room retention policy is not allowed',
				{
					method: 'saveRoomSettings',
					action: 'Editing_room'
				}
			);
		}
	},
	retentionIgnoreThreads({ userId, value, room, rid }) {
		if (
			!hasPermission(userId, 'edit-room-retention-policy', rid) &&
			value !== room.retention.ignoreThreads
		) {
			throw new Meteor.Error(
				'error-action-not-allowed',
				'Editing room retention policy is not allowed',
				{
					method: 'saveRoomSettings',
					action: 'Editing_room'
				}
			);
		}
	},
	roomAvatar({ userId, rid }) {
		if (!hasPermission(userId, 'edit-room-avatar', rid)) {
			throw new Meteor.Error(
				'error-action-not-allowed',
				'Editing a room avatar is not allowed',
				{
					method: 'saveRoomSettings',
					action: 'Editing_room'
				}
			);
		}
	}
};

const settingSavers = {
	roomName({ value, rid, user, extraData }) {
		saveRoomName(rid, value, user, true, extraData);
	},
	roomTopic({ value, room, rid, user }) {
		if (value !== room.topic) {
			saveRoomTopic(rid, value, user);
		}
	},
	roomAnnouncement({ value, room, rid, user }) {
		if (value !== room.announcement) {
			saveRoomAnnouncement(rid, value, user);
		}
	},
	roomCustomFields({ value, room, rid }) {
		if (value !== room.customFields) {
			saveRoomCustomFields(rid, value);
		}
	},
	roomDescription({ value, room, rid, user }) {
		if (value !== room.description) {
			saveRoomDescription(rid, value, user);
		}
	},
	roomType({ value, room, rid, user }) {
		if (value !== room.t) {
			saveRoomType(rid, value, user);
		}
	},
	tokenpass({ value, rid }) {
		check(value, {
			require: String,
			tokens: [
				{
					token: String,
					balance: String
				}
			]
		});
		saveRoomTokenpass(rid, value);
	},
	streamingOptions({ value, rid }) {
		saveStreamingOptions(rid, value);
	},
	readOnly({ value, room, rid, user }) {
		if (value !== room.ro) {
			saveRoomReadOnly(rid, value, user);
		}
	},
	reactWhenReadOnly({ value, room, rid, user }) {
		if (value !== room.reactWhenReadOnly) {
			saveReactWhenReadOnly(rid, value, user);
		}
	},
	systemMessages({ value, room, rid, user }) {
		if (JSON.stringify(value) !== JSON.stringify(room.sysMes)) {
			saveRoomSystemMessages(rid, value, user);
		}
	},
	default({ value, rid }) {
		Rooms.saveDefaultById(rid, value);
	},
	featured({ value, rid }) {
		Rooms.saveFeaturedById(rid, value);
	},
	retentionEnabled({ value, rid }) {
		Rooms.saveRetentionEnabledById(rid, value);
	},
	retentionMaxAge({ value, rid }) {
		Rooms.saveRetentionMaxAgeById(rid, value);
	},
	retentionExcludePinned({ value, rid }) {
		Rooms.saveRetentionExcludePinnedById(rid, value);
	},
	retentionFilesOnly({ value, rid }) {
		Rooms.saveRetentionFilesOnlyById(rid, value);
	},
	retentionIgnoreThreads({ value, rid }) {
		Rooms.saveRetentionIgnoreThreadsById(rid, value);
	},
	retentionOverrideGlobal({ value, rid }) {
		Rooms.saveRetentionOverrideGlobalById(rid, value);
	},
	encrypted({ value, room, rid, user }) {
		saveRoomEncrypted(
			rid,
			value,
			user,
			Boolean(room.encrypted) !== Boolean(value)
		);
	},
	favorite({ value, rid }) {
		Rooms.saveFavoriteById(rid, value.favorite, value.defaultValue);
	},
	roomAvatar({ value, room, rid, user }) {
		if (value !== room.avatarETag) {
			setRoomAvatar(rid, value, user);
		}
	}
};

Meteor.methods({
	saveRoomSettings(rid, settings, value, extraData) {
		const userId = Meteor.userId();

		if (!userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				function: 'RocketChat.saveRoomName'
			});
		}
		if (!Match.test(rid, String)) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', {
				method: 'saveRoomSettings'
			});
		}

		if (typeof settings !== 'object') {
			settings = {
				[settings]: value
			};
		}

		if (!Object.keys(settings).every(key => fields.includes(key))) {
			throw new Meteor.Error(
				'error-invalid-settings',
				'Invalid settings provided',
				{
					method: 'saveRoomSettings'
				}
			);
		}

		const room = Rooms.findOneById(rid);

		if (!room) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', {
				method: 'saveRoomSettings'
			});
		}

		if (!hasPermission(userId, 'edit-room', rid)) {
			if (
				!(Object.keys(settings).includes('encrypted') && room.t === 'd')
			) {
				throw new Meteor.Error(
					'error-action-not-allowed',
					'Editing room is not allowed',
					{
						method: 'saveRoomSettings',
						action: 'Editing_room'
					}
				);
			}
			settings = { encrypted: settings.encrypted };
		}

		if (
			room.broadcast &&
			(settings.readOnly || settings.reactWhenReadOnly)
		) {
			throw new Meteor.Error(
				'error-action-not-allowed',
				'Editing readOnly/reactWhenReadOnly are not allowed for broadcast rooms',
				{
					method: 'saveRoomSettings',
					action: 'Editing_room'
				}
			);
		}

		const user = Meteor.user();

		// validations
		Object.keys(settings).forEach(setting => {
			const value = settings[setting];

			const validator = validators[setting];
			if (validator) {
				validator({
					userId,
					value,
					room,
					rid
				});
			}

			if (setting === 'retentionOverrideGlobal') {
				delete settings.retentionMaxAge;
				delete settings.retentionExcludePinned;
				delete settings.retentionFilesOnly;
				delete settings.retentionIgnoreThreads;
			}
		});

		// saving data
		Object.keys(settings).forEach(setting => {
			const value = settings[setting];

			const saver = settingSavers[setting];
			if (saver) {
				saver({
					value,
					room,
					rid,
					user,
					extraData
				});
			}
		});

		Meteor.defer(function () {
			const room = Rooms.findOneById(rid);
			callbacks.run('afterSaveRoomSettings', room);
		});

		return {
			result: true,
			rid: room._id
		};
	}
});
