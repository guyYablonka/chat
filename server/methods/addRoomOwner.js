import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { hasPermission } from '../../app/authorization';
import { Users, Subscriptions, Messages } from '../../app/models';
import { settings } from '../../app/settings';
import { api } from '../sdk/api';
import { extractRoomOwnerAddition } from '../../app/lib/server/functions/extractions/extractRoomOwnerAddition';

Meteor.methods({
	addRoomOwner(rid, userId, extraData = {}) {
		check(rid, String);
		check(userId, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'addRoomOwner'
			});
		}

		if (!hasPermission(Meteor.userId(), 'set-owner', rid)) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'addRoomOwner'
			});
		}

		const user = Users.findOneById(userId);

		if (!user || !user.username) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'addRoomOwner'
			});
		}

		const subscription = Subscriptions.findOneByRoomIdAndUserId(
			rid,
			user._id
		);

		if (!subscription) {
			throw new Meteor.Error(
				'error-user-not-in-room',
				'User is not in this room',
				{
					method: 'addRoomOwner'
				}
			);
		}

		if (
			Array.isArray(subscription.roles) === true &&
			subscription.roles.includes('owner') === true
		) {
			throw new Meteor.Error(
				'error-user-already-owner',
				'User is already an owner',
				{
					method: 'addRoomOwner'
				}
			);
		}

		Subscriptions.addRoleById(subscription._id, 'owner', extraData);

		const fromUser = Users.findOneById(Meteor.userId());

		extractRoomOwnerAddition(subscription, fromUser, extraData);

		Messages.createSubscriptionRoleAddedWithRoomIdAndUser(rid, user, {
			u: {
				_id: fromUser._id,
				username: fromUser.username
			},
			role: 'owner'
		});

		if (settings.get('UI_DisplayRoles')) {
			api.broadcast('user.roleUpdate', {
				type: 'added',
				_id: 'owner',
				u: {
					_id: user._id,
					username: user.username,
					name: user.name
				},
				scope: rid
			});
		}

		return true;
	}
});
