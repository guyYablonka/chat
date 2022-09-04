import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { hasPermission } from '../../../authorization';
import { Subscriptions, Users } from '../../../models';
import { API } from '../api';
import getSubscriptionsByRoomId from '/app/lib/server/functions/getSubscriptionsByRoomId';

API.v1.addRoute(
	'subscriptions.get',
	{ authRequired: true },
	{
		get() {
			const { updatedSince } = this.queryParams;

			let updatedSinceDate;
			if (updatedSince) {
				if (isNaN(Date.parse(updatedSince))) {
					throw new Meteor.Error(
						'error-roomId-param-invalid',
						'The "lastUpdate" query parameter must be a valid date.'
					);
				} else {
					updatedSinceDate = new Date(updatedSince);
				}
			}

			let result;
			Meteor.runAsUser(this.userId, () => {
				result = Meteor.call('subscriptions/get', updatedSinceDate);
			});

			if (Array.isArray(result)) {
				result = {
					update: result,
					remove: []
				};
			}

			return API.v1.success(result);
		}
	}
);

API.v1.addRoute(
	'subscriptions.getOne',
	{ authRequired: true },
	{
		get() {
			const { roomId } = this.requestParams();

			if (!roomId) {
				return API.v1.failure("The 'roomId' param is required");
			}

			const subscription = Subscriptions.findOneByRoomIdAndUserId(
				roomId,
				this.userId
			);

			return API.v1.success({
				subscription
			});
		}
	}
);

API.v1.addRoute(
	'subscriptions.getByRoom',
	{ authRequired: true },
	{
		get() {
			const proxyRole = this.isProxyBot();

			if (!proxyRole) {
				return API.v1.unauthorized();
			}

			const { roomId } = this.requestParams();

			if (!roomId) {
				return API.v1.failure("The 'roomId' param is required");
			}

			const subs = getSubscriptionsByRoomId(roomId);

			return API.v1.success({
				subs
			});
		}
	}
);

/**
	This API is suppose to mark any room as read.

	Method: POST
	Route: api/v1/subscriptions.read
	Params:
		- rid: The rid of the room to be marked as read.
 */
API.v1.addRoute(
	'subscriptions.read',
	{ authRequired: true },
	{
		post() {
			// Temporary for mobile adjustment to work with old version of own room id
			const { rid } = this.requestParams();

			const selfRoomId = this.getOldSelfDM(rid);

			if (selfRoomId) {
				this.bodyParams.rid = selfRoomId;
			}

			check(this.bodyParams, {
				rid: String
			});

			Meteor.runAsUser(this.userId, () =>
				Meteor.call('readMessages', this.bodyParams.rid)
			);

			return API.v1.success();
		}
	}
);

API.v1.addRoute(
	'subscriptions.readAsUser',
	{ authRequired: true },
	{
		post() {
			if (!hasPermission(this.userId, 'use-as-user-routes')) {
				return API.v1.unauthorized();
			}

			this.validateReadAsUserParams();

			const { fromUsername: fromUsernameOrEmail, extraData } =
				this.bodyParams;

			const fromUser =
				Users.findOneByUsernameOrEmail(fromUsernameOrEmail);

			if (!fromUser) {
				throw new Meteor.Error(
					'error-invalid-user',
					`User ${fromUsernameOrEmail} does not exist.`
				);
			}

			const room = this.getRoomOrCreateDirect(this.bodyParams, fromUser);

			if (!room) {
				throw new Meteor.Error(
					'error-invalid-roomId',
					`room ${
						this.bodyParams.roomId ||
						this.bodyParams.roomName ||
						this.bodyParams.targetUsername
					} does not exist.`
				);
			}
			if (!Meteor.call('canAccessRoom', room._id, fromUser._id)) {
				throw new Meteor.Error(
					'error-no-access',
					`User ${fromUsernameOrEmail} is not in room ${room.name}.`
				);
			}

			const proxyBotRole = this.isProxyBot();

			if (proxyBotRole) {
				this.validateExternalOrigin(proxyBotRole, fromUser, room);
			}

			Meteor.runAsUser(fromUser._id, () =>
				Meteor.call('readMessages', room._id, extraData)
			);

			return API.v1.success();
		}
	}
);

API.v1.addRoute(
	'subscriptions.unread',
	{ authRequired: true },
	{
		post() {
			const { roomId, firstUnreadMessage } = this.bodyParams;
			if (!roomId && firstUnreadMessage && !firstUnreadMessage._id) {
				return API.v1.failure(
					'At least one of "roomId" or "firstUnreadMessage._id" params is required'
				);
			}

			Meteor.runAsUser(this.userId, () =>
				Meteor.call('unreadMessages', firstUnreadMessage, roomId)
			);

			return API.v1.success();
		}
	}
);

API.v1.addRoute(
	'subscriptions.nameColors',
	{ authRequired: true },
	{
		get() {
			const { roomId } = this.requestParams();
			if (!roomId) {
				return API.v1.failure('"roomId" param is required');
			}

			const result = Meteor.runAsUser(this.userId, () =>
				Meteor.call('getMemberColorDictionaryForRoom', roomId)
			);

			const userObjects = Object.entries(result).map(([id, color]) => ({
				id,
				color: color || '#ff7fef'
			}));

			return API.v1.success({
				nameColors: userObjects
			});
		}
	}
);
