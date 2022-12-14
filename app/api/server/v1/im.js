import { Meteor } from 'meteor/meteor';

import {
	Subscriptions,
	Uploads,
	Users,
	Messages,
	Rooms
} from '../../../models';
import { hasPermission } from '../../../authorization';
import { normalizeMessagesForUser } from '../../../utils/server/lib/normalizeMessagesForUser';
import { settings } from '../../../settings';
import { API } from '../api';
import { getDirectMessageByNameOrIdWithOptionToJoin } from '../../../lib/server/functions/getDirectMessageByNameOrIdWithOptionToJoin';
import { removeReactionNames } from '../../../lib/server/functions';

function findDirectMessageRoom(params, user) {
	if (
		(!params.roomId || !params.roomId.trim()) &&
		(!params.username || !params.username.trim())
	) {
		throw new Meteor.Error(
			'error-room-param-not-provided',
			'Body param "roomId" or "username" is required'
		);
	}

	const room = getDirectMessageByNameOrIdWithOptionToJoin({
		currentUserId: user._id,
		nameOrId: params.username || params.roomId
	});

	const canAccess = Meteor.call('canAccessRoom', room._id, user._id);
	if (!canAccess || !room || room.t !== 'd') {
		throw new Meteor.Error(
			'error-room-not-found',
			'The required "roomId" or "username" param provided does not match any direct message'
		);
	}

	const subscription = Subscriptions.findOneByRoomIdAndUserId(
		room._id,
		user._id
	);

	return {
		room,
		subscription
	};
}

API.v1.addRoute(
	['dm.create', 'im.create'],
	{ authRequired: true },
	{
		post() {
			const { username, usernames } = this.requestParams();

			const users = username
				? [username]
				: usernames &&
				  usernames.split(',').map(username => username.trim());

			if (!users) {
				throw new Meteor.Error(
					'error-room-not-found',
					'The required "username" or "usernames" param provided does not match any direct message'
				);
			}

			const room = Meteor.call('createDirectMessage', ...users);

			return API.v1.success({
				room: { ...room, _id: room.rid }
			});
		}
	}
);

API.v1.addRoute(
	['dm.close', 'im.close'],
	{ authRequired: true },
	{
		post() {
			const findResult = findDirectMessageRoom(
				this.requestParams(),
				this.user
			);

			if (!findResult.subscription.open) {
				return API.v1.failure(
					`The direct message room, ${this.bodyParams.name}, is already closed to the sender`
				);
			}

			Meteor.runAsUser(this.userId, () => {
				Meteor.call('hideRoom', findResult.room._id);
			});

			return API.v1.success();
		}
	}
);

API.v1.addRoute(
	['dm.counters', 'im.counters'],
	{ authRequired: true },
	{
		get() {
			const access = hasPermission(
				this.userId,
				'view-room-administration'
			);
			const ruserId = this.requestParams().userId;
			let user = this.userId;
			let unreads = null;
			let userMentions = null;
			let unreadsFrom = null;
			let joined = false;
			let msgs = null;
			let latest = null;
			let members = null;
			let lm = null;

			if (ruserId) {
				if (!access) {
					return API.v1.unauthorized();
				}
				user = ruserId;
			}
			const rs = findDirectMessageRoom(this.requestParams(), {
				_id: user
			});
			const { room } = rs;
			const dm = rs.subscription;
			lm = room.lm ? room.lm : room._updatedAt;

			if (typeof dm !== 'undefined' && dm.open) {
				if (dm.ls && room.msgs) {
					unreads = dm.unread;
					unreadsFrom = dm.ls;
				}
				userMentions = dm.userMentions;
				joined = true;
			}

			if (access || joined) {
				msgs = room.msgs;
				latest = lm;
				members = room.usersCount;
			}

			return API.v1.success({
				joined,
				members,
				unreads,
				unreadsFrom,
				msgs,
				latest,
				userMentions
			});
		}
	}
);

API.v1.addRoute(
	['dm.files', 'im.files'],
	{ authRequired: true },
	{
		get() {
			const findResult = findDirectMessageRoom(
				this.requestParams(),
				this.user
			);
			const addUserObjectToEveryObject = file => {
				if (file.userId) {
					file = this.insertUserObject({
						object: file,
						userId: file.userId
					});
				}
				return file;
			};

			const { offset, count } = this.getPaginationItems();
			const { sort, fields, query } = this.parseJsonQuery();

			const ourQuery = Object.assign({}, query, {
				rid: findResult.room._id
			});

			const files = Uploads.find(ourQuery, {
				sort: sort || { name: 1 },
				skip: offset,
				limit: count,
				fields
			}).fetch();

			return API.v1.success({
				files: files.map(addUserObjectToEveryObject),
				count: files.length,
				offset,
				total: Uploads.find(ourQuery).count()
			});
		}
	}
);

API.v1.addRoute(
	['dm.files.limited', 'im.files.limited'],
	{ authRequired: true },
	{
		get() {
			// Temporary for mobile adjustment to work with old version of own room id
			const { roomId } = this.requestParams();

			const selfRoomId = this.getOldSelfDM(roomId);

			if (selfRoomId) {
				this.queryParams.roomId = selfRoomId;
			}

			const findResult = findDirectMessageRoom(
				this.requestParams(),
				this.user
			);
			const addUserObjectToEveryObject = file => {
				if (file.userId) {
					file = this.insertUserObject({
						object: file,
						userId: file.userId
					});
				}
				return file;
			};

			const { offset, count } = this.getPaginationItems();
			const { sort, fields, query } = this.parseJsonQuery();

			const ourQuery = Object.assign({}, query, {
				rid: findResult.room._id
			});

			if (settings.get('Message_History_Time_Limit_Enabled')) {
				const limitedDate = this.getLimit();
				ourQuery._updatedAt = { $gt: limitedDate };
			}

			const files = Uploads.find(ourQuery, {
				sort: sort || { name: 1 },
				skip: offset,
				limit: count,
				fields
			}).fetch();

			return API.v1.success({
				files: files.map(addUserObjectToEveryObject),
				count: files.length,
				offset,
				total: Uploads.find(ourQuery).count()
			});
		}
	}
);

API.v1.addRoute(
	['dm.history', 'im.history'],
	{ authRequired: true },
	{
		get() {
			const findResult = findDirectMessageRoom(
				this.requestParams(),
				this.user
			);

			let latestDate = new Date();
			if (this.queryParams.latest) {
				latestDate = new Date(this.queryParams.latest);
			}

			let oldestDate = undefined;
			if (this.queryParams.oldest) {
				oldestDate = new Date(this.queryParams.oldest);
			}

			const inclusive = this.queryParams.inclusive || false;

			let count = 20;
			if (this.queryParams.count) {
				count = parseInt(this.queryParams.count);
			}

			let offset = 0;
			if (this.queryParams.offset) {
				offset = parseInt(this.queryParams.offset);
			}

			const unreads = this.queryParams.unreads || false;

			let result;
			Meteor.runAsUser(this.userId, () => {
				result = Meteor.call('getChannelHistory', {
					rid: findResult.room._id,
					latest: latestDate,
					oldest: oldestDate,
					inclusive,
					offset,
					count,
					unreads
				});
			});

			if (!result) {
				return API.v1.unauthorized();
			}

			return API.v1.success(result);
		}
	}
);
// Body Params: sender (username), username or usernames (string list splitted with commas)
API.v1.addRoute(
	'dm.createAsUser',
	{ authRequired: true },
	{
		post() {
			if (!hasPermission(this.userId, 'use-as-user-routes')) {
				return API.v1.unauthorized();
			}

			const { sender, username, usernames } = this.requestParams();

			if (!sender || (!username && !usernames)) {
				throw new Meteor.Error(
					'error-invalid-params',
					`Parameter is missing.`
				);
			}

			const senderUser = Users.findOneByUsernameOrEmail(sender);

			const proxyBot = this.isProxyBot();

			if (proxyBot) {
				this.validateCreatorOrigin(proxyBot, senderUser);
			}

			const users = username
				? [username]
				: usernames &&
				  usernames.split(',').map(username => username.trim());

			if (!users) {
				throw new Meteor.Error(
					'error-room-not-found',
					'The required "username" or "usernames" param provided does not match any direct message'
				);
			}

			const room = Meteor.call(
				'createDirectMessageAsUser',
				users,
				senderUser
			);

			return API.v1.success({
				room: { ...room, _id: room.rid }
			});
		}
	}
);

API.v1.addRoute(
	['dm.history.limited', 'im.history.limited'],
	{ authRequired: true },
	{
		get() {
			// Temporary for mobile adjustment to work with old version of own room id
			const { roomId } = this.requestParams();

			const selfRoomId = this.getOldSelfDM(roomId);

			if (selfRoomId) {
				this.queryParams.roomId = selfRoomId;
			}

			const findResult = findDirectMessageRoom(
				this.requestParams(),
				this.user
			);

			let latestDate = new Date();
			if (this.queryParams.latest) {
				latestDate = new Date(this.queryParams.latest);
			}

			let oldestDate = undefined;
			if (this.queryParams.oldest) {
				oldestDate = new Date(this.queryParams.oldest);
			}

			if (settings.get('Message_History_Time_Limit_Enabled')) {
				const limitedDate = this.getLimit();

				if (latestDate < limitedDate) {
					oldestDate = latestDate = limitedDate;
				} else if (oldestDate < limitedDate) {
					oldestDate = limitedDate;
				}
			}

			const inclusive = this.queryParams.inclusive || false;

			let count = 20;
			if (this.queryParams.count) {
				count = parseInt(this.queryParams.count);
			}

			let offset = 0;
			if (this.queryParams.offset) {
				offset = parseInt(this.queryParams.offset);
			}

			const unreads = this.queryParams.unreads || false;

			let result;
			Meteor.runAsUser(this.userId, () => {
				result = Meteor.call('getChannelHistory', {
					rid: findResult.room._id,
					latest: latestDate,
					oldest: oldestDate,
					inclusive,
					offset,
					count,
					unreads
				});
			});

			if (!result) {
				return API.v1.unauthorized();
			}

			result.messages = removeReactionNames(result.messages);

			return API.v1.success(result);
		}
	}
);

API.v1.addRoute(
	['dm.members', 'im.members'],
	{ authRequired: true },
	{
		get() {
			// Temporary for mobile adjustment to work with old version of own room id
			const { roomId } = this.requestParams();

			const selfRoomId = this.getOldSelfDM(roomId);

			if (selfRoomId) {
				this.queryParams.roomId = selfRoomId;
			}

			const findResult = findDirectMessageRoom(
				this.requestParams(),
				this.user
			);

			const { offset, count } = this.getPaginationItems();
			const { sort } = this.parseJsonQuery();
			const cursor = Subscriptions.findByRoomId(findResult.room._id, {
				sort: {
					'u.username': sort && sort.username ? sort.username : 1
				},
				skip: offset,
				limit: count
			});

			const total = cursor.count();
			const members = cursor.fetch().map(s => s.u && s.u.username);

			const users = Users.find(
				{ username: { $in: members } },
				{
					fields: {
						_id: 1,
						username: 1,
						name: 1,
						status: 1,
						statusText: 1,
						utcOffset: 1,
						customFields: 1
					},
					sort: {
						username: sort && sort.username ? sort.username : 1
					}
				}
			).fetch();

			return API.v1.success({
				members: users,
				count: members.length,
				offset,
				total
			});
		}
	}
);

API.v1.addRoute(
	['dm.messages', 'im.messages'],
	{ authRequired: true },
	{
		get() {
			const findResult = findDirectMessageRoom(
				this.requestParams(),
				this.user
			);

			const { offset, count } = this.getPaginationItems();
			const { sort, fields, query } = this.parseJsonQuery();

			const ourQuery = Object.assign({}, query, {
				rid: findResult.room._id
			});

			const messages = Messages.find(ourQuery, {
				sort: sort || { ts: -1 },
				skip: offset,
				limit: count,
				fields
			}).fetch();

			return API.v1.success({
				messages: normalizeMessagesForUser(messages, this.userId),
				count: messages.length,
				offset,
				total: Messages.find(ourQuery).count()
			});
		}
	}
);

API.v1.addRoute(
	['dm.messages.limited', 'im.messages.limited'],
	{ authRequired: true },
	{
		get() {
			// Temporary for mobile adjustment to work with old version of own room id
			const { roomId } = this.requestParams();

			const selfRoomId = this.getOldSelfDM(roomId);

			if (selfRoomId) {
				this.queryParams.roomId = selfRoomId;
			}

			const findResult = findDirectMessageRoom(
				this.requestParams(),
				this.user
			);

			const { offset, count } = this.getPaginationItems();
			const { sort, fields, query } = this.parseJsonQuery();

			const ourQuery = Object.assign({}, query, {
				rid: findResult.room._id
			});

			if (settings.get('Message_History_Time_Limit_Enabled')) {
				const limitedDate = this.getLimit();
				ourQuery._updatedAt = { $gt: limitedDate };
			}

			const messages = Messages.find(ourQuery, {
				sort: sort || { ts: -1 },
				skip: offset,
				limit: count,
				fields
			}).fetch();

			const normailezedMesages = normalizeMessagesForUser(
				messages,
				this.userId
			);

			const messagesWithoutReactionNames =
				removeReactionNames(normailezedMesages);

			return API.v1.success({
				messages: messagesWithoutReactionNames,
				count: messagesWithoutReactionNames.length,
				offset,
				total: Messages.find(ourQuery).count()
			});
		}
	}
);

API.v1.addRoute(
	['dm.messages.others', 'im.messages.others'],
	{ authRequired: true },
	{
		get() {
			if (
				settings.get('API_Enable_Direct_Message_History_EndPoint') !==
				true
			) {
				throw new Meteor.Error(
					'error-endpoint-disabled',
					'This endpoint is disabled',
					{
						route: '/api/v1/im.messages.others'
					}
				);
			}

			if (!hasPermission(this.userId, 'view-room-administration')) {
				return API.v1.unauthorized();
			}

			const { roomId } = this.queryParams;
			if (!roomId || !roomId.trim()) {
				throw new Meteor.Error(
					'error-roomid-param-not-provided',
					'The parameter "roomId" is required'
				);
			}

			const room = Rooms.findOneById(roomId);
			if (!room || room.t !== 'd') {
				throw new Meteor.Error(
					'error-room-not-found',
					`No direct message room found by the id of: ${roomId}`
				);
			}

			const { offset, count } = this.getPaginationItems();
			const { sort, fields, query } = this.parseJsonQuery();
			const ourQuery = Object.assign({}, query, { rid: room._id });

			const msgs = Messages.find(ourQuery, {
				sort: sort || { ts: -1 },
				skip: offset,
				limit: count,
				fields
			}).fetch();

			return API.v1.success({
				messages: normalizeMessagesForUser(msgs, this.userId),
				offset,
				count: msgs.length,
				total: Messages.find(ourQuery).count()
			});
		}
	}
);

API.v1.addRoute(
	['dm.list', 'im.list'],
	{ authRequired: true },
	{
		get() {
			const { offset, count } = this.getPaginationItems();
			const { sort = { name: 1 }, fields } = this.parseJsonQuery();

			// TODO: CACHE: Add Breacking notice since we removed the query param

			const cursor = Rooms.findBySubscriptionTypeAndUserId(
				'd',
				this.userId,
				{
					sort,
					skip: offset,
					limit: count,
					fields
				}
			);

			const total = cursor.count();
			const rooms = cursor.fetch();

			return API.v1.success({
				ims: rooms.map(room =>
					this.composeRoomWithLastMessage(room, this.userId)
				),
				offset,
				count: rooms.length,
				total
			});
		}
	}
);

API.v1.addRoute(
	['dm.open', 'im.open'],
	{ authRequired: true },
	{
		post() {
			const findResult = findDirectMessageRoom(
				this.requestParams(),
				this.user
			);

			if (!findResult.subscription.open) {
				Meteor.runAsUser(this.userId, () => {
					Meteor.call('openRoom', findResult.room._id);
				});
			}
			return API.v1.success();
		}
	}
);

API.v1.addRoute(
	['dm.list.everyone', 'im.list.everyone'],
	{ authRequired: true },
	{
		get() {
			if (!hasPermission(this.userId, 'view-room-administration')) {
				return API.v1.unauthorized();
			}

			const { offset, count } = this.getPaginationItems();
			const { sort, fields, query } = this.parseJsonQuery();

			const ourQuery = Object.assign({}, query, { t: 'd' });

			const rooms = Rooms.find(ourQuery, {
				sort: sort || { name: 1 },
				skip: offset,
				limit: count,
				fields
			}).fetch();

			return API.v1.success({
				ims: rooms.map(room =>
					this.composeRoomWithLastMessage(room, this.userId)
				),
				offset,
				count: rooms.length,
				total: Rooms.find(ourQuery).count()
			});
		}
	}
);

API.v1.addRoute(
	['dm.setTopic', 'im.setTopic'],
	{ authRequired: true },
	{
		post() {
			if (!this.bodyParams.hasOwnProperty('topic')) {
				return API.v1.failure('The bodyParam "topic" is required');
			}

			const findResult = findDirectMessageRoom(
				this.requestParams(),
				this.user
			);

			Meteor.runAsUser(this.userId, () => {
				Meteor.call(
					'saveRoomSettings',
					findResult.room._id,
					'roomTopic',
					this.bodyParams.topic
				);
			});

			return API.v1.success({
				topic: this.bodyParams.topic
			});
		}
	}
);
