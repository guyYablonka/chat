import { AppsEngineException } from '@rocket.chat/apps-engine/definition/exceptions';
import { Meteor } from 'meteor/meteor';
import _ from 'underscore';

import { Apps } from '../../../apps/server';
import { callbacks } from '../../../callbacks/server';
import { Rooms, Subscriptions } from '../../../models/server';
import { settings } from '../../../settings/server';
import { getDefaultSubscriptionPref } from '../../../utils/server';
import { getDestinations } from './getDestinations';
import { extractDirectRoomCreation } from './extractions/extractDirectRoomCreation';
import { getDirectDisplayName } from './getDirectDisplayName';

const generateSubscription = (fname, name, directDisplayName, user, extra) => ({
	alert: false,
	unread: 0,
	userMentions: 0,
	groupMentions: 0,
	...(user.customFields && { customFields: user.customFields }),
	...getDefaultSubscriptionPref(user),
	...extra,
	t: 'd',
	fname,
	name,
	directDisplayName,
	u: {
		_id: user._id,
		username: user.username
	}
});

const getFname = members =>
	members.map(({ name, username }) => name || username).join(', ');
const getName = members => members.map(({ username }) => username).join(', ');
const getDisplayName = members =>
	members.map(member => getDirectDisplayName(member)).join(', ');
export const createDirectRoom = function (
	members,
	roomExtraData = {},
	options = {}
) {
	if (members.length > (settings.get('DirectMesssage_maxUsers') || 1)) {
		throw new Error('error-direct-message-max-user-exceeded');
	}

	const sortedMembers = members.sort((u1, u2) =>
		(u1.name || u1.username).localeCompare(u2.name || u2.username)
	);

	const usernames = sortedMembers.map(({ username }) => username);
	const uids = members.map(({ _id }) => _id).sort();

	// Deprecated: using users' _id to compose the room _id is deprecated
	const room =
		uids.length === 2
			? Rooms.findOneById(uids.join(''), { fields: { _id: 1 } })
			: Rooms.findOneDirectRoomContainingAllUserIDs(uids, {
					fields: { _id: 1 }
			  });

	const isNewRoom = !room;

	const roomInfo = {
		...(uids.length === 2 && { _id: uids.join('') }), // Deprecated: using users' _id to compose the room _id is deprecated
		t: 'd',
		usernames,
		usersCount: members.length,
		msgs: 0,
		ts: new Date(),
		uids,
		...roomExtraData
	};

	if (isNewRoom) {
		roomInfo._USERNAMES = usernames;

		const prevent = Promise.await(
			Apps.triggerEvent('IPreRoomCreatePrevent', roomInfo).catch(
				error => {
					if (error instanceof AppsEngineException) {
						throw new Meteor.Error(
							'error-app-prevented',
							error.message
						);
					}

					throw error;
				}
			)
		);
		if (prevent) {
			throw new Meteor.Error(
				'error-app-prevented',
				'A Rocket.Chat App prevented the room creation.'
			);
		}

		let result;
		result = Promise.await(
			Apps.triggerEvent('IPreRoomCreateExtend', roomInfo)
		);
		result = Promise.await(
			Apps.triggerEvent('IPreRoomCreateModify', result)
		);

		if (typeof result === 'object') {
			Object.assign(roomInfo, result);
		}

		delete roomInfo._USERNAMES;
		const dmDestinations =
			members.length === 1 ? {} : getDestinations(usernames);

		if (!_.isEmpty(dmDestinations)) {
			roomInfo.destinations = dmDestinations;
		}
	}

	const rid = room?._id || Rooms.insertOrUpsert(roomInfo);

	if (members.length === 1) {
		// dm to yourself
		const yourself = members[0];
		Subscriptions.upsert(
			{ rid, 'u._id': yourself._id },
			{
				$set: {
					open: false
				},
				$setOnInsert: generateSubscription(
					yourself.name || yourself.username,
					yourself.username,
					getDisplayName([yourself]),
					yourself,
					{ ...options.subscriptionExtra }
				)
			}
		);
	} else {
		members.forEach(member => {
			const otherMembers = sortedMembers.filter(
				({ _id }) => _id !== member._id
			);

			Subscriptions.upsert(
				{ rid, 'u._id': member._id },
				{
					...(options.creator === member._id && {
						$set: {
							open: false
						}
					}),
					$setOnInsert: generateSubscription(
						getFname(otherMembers),
						getName(otherMembers),
						getDisplayName(otherMembers),
						member,
						{
							...options.subscriptionExtra,
							...(options.creator !== member._id && {
								open: members.length > 2
							})
						}
					)
				}
			);
		});
	}

	// If the room is new, run a callback
	if (isNewRoom) {
		const insertedRoom = Rooms.findOneById(rid);

		callbacks.run('afterCreateDirectRoom', insertedRoom, { members });

		Apps.triggerEvent('IPostRoomCreate', insertedRoom);

		extractDirectRoomCreation(insertedRoom);
	}

	return {
		_id: rid,
		usernames,
		t: 'd',
		inserted: isNewRoom
	};
};
