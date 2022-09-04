import { settings } from '../../../settings/server';
import { Users } from '../../../models/server';

export const getDestinations = (usernames, externalUserRoles) => {
	let externalChatRoles = [];

	try {
		externalChatRoles =
			externalUserRoles ??
			JSON.parse(settings.get('API_External_Chat_User_Roles'));
	} catch (err) {
		throw new Meteor.Error(
			'error-invalid-settings',
			'Unable to parse API_External_Chat_User_Roles. Must be an array',
			{
				function: 'getDestinations'
			}
		);
	}

	const destinations = {};

	const iteratedUsers = Users.findByUsernames(usernames);

	iteratedUsers.forEach(user => {
		user.roles.forEach(role => {
			if (externalChatRoles.includes(role)) {
				if (destinations[role]) {
					destinations[role]++;
				} else {
					destinations[role] = 1;
				}
			}
		});
	});

	return destinations;
};
