import { Meteor } from 'meteor/meteor';

import { Users } from '../../app/models/server';
import { hasPermission } from '../../app/authorization';
import { settings } from '../../app/settings';

function findUsers({ rid, status, skip, limit, filter = '' }) {
	const options = {
		fields: {
			name: 1,
			username: 1,
			nickname: 1,
			status: 1,
			avatarETag: 1,
			active: 1
		},
		sort: {
			active: -1,
			statusConnection: -1,
			[settings.get('UI_Use_Real_Name') ? 'name' : 'username']: 1
		},
		...(skip > 0 && { skip }),
		...(limit > 0 && { limit })
	};

	return Users.findByUsersExcept(filter, undefined, options, undefined, [
		{
			__rooms: rid,
			...(status && { status })
		}
	]);
}

Meteor.methods({
	getUsersOfRoom(rid, filter, showAll, { limit, skip } = {}) {
		const userId = Meteor.userId();
		if (!userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'getUsersOfRoom'
			});
		}

		const room = Meteor.call('canAccessRoom', rid, userId);
		if (!room) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', {
				method: 'getUsersOfRoom'
			});
		}

		if (
			room.broadcast &&
			!hasPermission(userId, 'view-broadcast-member-list', rid)
		) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'getUsersOfRoom'
			});
		}

		const optionsWithoutLimitAndSkip = {
			rid,
			status: !showAll ? { $ne: 'offline' } : undefined,
			limit: undefined,
			skip: undefined,
			filter
		};

		const total = findUsers(optionsWithoutLimitAndSkip).count();

		const optionsWithLimitAndSkip = {
			rid,
			status: !showAll ? { $ne: 'offline' } : undefined,
			limit,
			skip,
			filter
		};

		const users = findUsers(optionsWithLimitAndSkip).fetch();

		return {
			total,
			records: users
		};
	}
});
