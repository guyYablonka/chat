import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { settings } from '../../app/settings';
import { hasPermission } from '../../app/authorization';
import { Users, Rooms } from '../../app/models';
import { RateLimiter } from '../../app/lib';
import { addUser } from '../../app/federation/server/functions/addUser';
import { createRoom } from '../../app/lib/server';

Meteor.methods({
	createDirectMessageAsUser(usernames = [], creator = null) {
		check(usernames, [String]);

		if (!(creator || Meteor.userId())) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'createDirectMessageAsUser'
			});
		}

		const me = creator || Meteor.user();

		if (!me.username) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'createDirectMessageAsUser'
			});
		}

		if (
			settings.get('Message_AllowDirectMessagesToYourself') === false &&
			usernames.length === 1 &&
			me.username === usernames[0]
		) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'createDirectMessageAsUser'
			});
		}

		const users = usernames
			.filter(username => username !== me.username)
			.map(username => {
				let to = Users.findOneByUsernameIgnoringCase(username);

				// If the username does have an `@`, but does not exist locally, we create it first
				if (!to && username.indexOf('@') !== -1) {
					to = addUser(username);
				}

				if (!to) {
					throw new Meteor.Error(
						'error-invalid-user',
						'Invalid user',
						{
							method: 'createDirectMessageAsUser'
						}
					);
				}
				return to;
			});

		if (!hasPermission(me._id, 'create-d')) {
			// If the user can't create DMs but can access already existing ones
			if (hasPermission(me._id, 'view-d-room')) {
				// Check if the direct room already exists, then return it

				const uids = [me, ...users].map(({ _id }) => _id).sort();
				const room = Rooms.findOneDirectRoomContainingAllUserIDs(uids, {
					fields: { _id: 1, destinations: 1 }
				});

				if (room) {
					return {
						t: 'd',
						rid: room._id,
						...room
					};
				}
			}

			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'createDirectMessageAsUser'
			});
		}

		const { _id: rid, inserted, ...room } = createRoom(
			'd',
			null,
			null,
			[me, ...users],
			null,
			{},
			{ creator: me._id }
		);

		return {
			t: 'd',
			rid: rid || room._id,
			...room
		};
	}
});
