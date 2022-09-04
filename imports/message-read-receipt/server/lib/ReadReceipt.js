import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import {
	ReadReceipts,
	Subscriptions,
	Messages,
	Rooms,
	Users,
	LivechatVisitors
} from '../../../../app/models';
import { settings } from '../../../../app/settings';
import { roomTypes } from '../../../../app/utils';

const rawReadReceipts = ReadReceipts.model.rawCollection();

// debounced function by roomId, so multiple calls within 2 seconds to same roomId runs only once
const list = {};
const debounceByRoomId = function (fn) {
	return function (roomId, ...args) {
		clearTimeout(list[roomId]);
		list[roomId] = setTimeout(() => {
			fn.call(this, roomId, ...args);
		}, 2000);
	};
};

const updateMessages = debounceByRoomId(
	Meteor.bindEnvironment(({ _id, lm }) => {
		// @TODO maybe store firstSubscription in room object so we don't need to call the above update method
		const firstSubscription = Subscriptions.getMinimumLastSeenByRoomId(_id);
		if (!firstSubscription) {
			return;
		}

		Messages.setAsRead(_id, firstSubscription.ls);

		if (lm <= firstSubscription.ls) {
			Rooms.setLastMessageAsRead(_id);
		}
	})
);

const allUsersEnteredTheRoomAtLeastOnce = rid => {
	const allUsersInRoom = Subscriptions.findByRoomId(rid).fetch();
	const usersCount = allUsersInRoom.length;
	const enteredRoom = allUsersInRoom.filter(user => user.ls).length;

	return usersCount === enteredRoom;
};

export const ReadReceipt = {
	markMessagesAsRead(roomId, userId, userLastSeen) {
		if (!settings.get('Message_Read_Receipt_Enabled')) {
			return;
		}

		const room = Rooms.findOneById(roomId, { fields: { lm: 1 } });

		// if users last seen is greadebounceByRoomIdter than room's last message, it means the user already have this room marked as read
		if (userLastSeen > room.lm) {
			return;
		}

		const options = {
			fields: {
				_id: 1
			}
		};

		const unreadMessageInRoom = userLastSeen
			? Messages.findUnreadMessagesByRoomAndDate(
					roomId,
					userLastSeen,
					options
			  )
			: Messages.findUnreadMessagesByRoom(roomId, options);

		this.storeReadReceipts(unreadMessageInRoom, roomId, userId);

		const allUsersInRoom = Subscriptions.findByRoomId(roomId).fetch();

		const allSeen =
			allUsersEnteredTheRoomAtLeastOnce(roomId) &&
			!allUsersInRoom.filter(user => user.ls < room.lm).length;

		if (allSeen) {
			updateMessages(room);
		}
	},

	markMessageAsReadBySender(message, roomId, userId) {
		if (!settings.get('Message_Read_Receipt_Enabled')) {
			return;
		}

		// this will usually happens if the message sender is the only one on the room
		const firstSubscription =
			Subscriptions.getMinimumLastSeenByRoomId(roomId);

		if (
			allUsersEnteredTheRoomAtLeastOnce(roomId) &&
			message.unread &&
			message.ts < firstSubscription.ls
		) {
			Messages.setAsReadById(message._id);
		}

		const room = Rooms.findOneById(roomId, { fields: { t: 1 } });
		const extraData = roomTypes
			.getConfig(room.t)
			.getReadReceiptsExtraData(message);

		this.storeReadReceipts(
			[{ _id: message._id }],
			roomId,
			userId,
			extraData
		);
	},

	async storeReadReceipts(messages, roomId, userId, extraData = {}) {
		if (settings.get('Message_Read_Receipt_Store_Users')) {
			const ts = new Date();
			const receipts = messages.map(message => ({
				_id: Random.id(),
				roomId,
				userId,
				messageId: message._id,
				ts,
				...extraData
			}));

			if (receipts.length === 0) {
				return;
			}

			try {
				await rawReadReceipts.insertMany(receipts);
			} catch (e) {
				console.error('Error inserting read receipts per user');
			}
		}
	},

	getReceipts(message) {
		return ReadReceipts.findByMessageId(message._id).map(receipt => ({
			...receipt,
			user: receipt.token
				? LivechatVisitors.getVisitorByToken(receipt.token, {
						fields: { username: 1, name: 1 }
				  })
				: Users.findOneById(receipt.userId, {
						fields: { username: 1, name: 1 }
				  })
		}));
	}
};
