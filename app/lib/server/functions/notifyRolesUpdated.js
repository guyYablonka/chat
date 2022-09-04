import { settings } from '../../../settings/server';
import { Logger } from '../../../logger/server';
import { incDestinationsByRoleChange } from './incDestinationsByRoleChange';
import { decDestinationsByRoleChange } from './decDestinationsByRoleChange';

const logger = new Logger('notifyRolesUpdated', {}, __filename);

export const notifyRolesUpdated = (userId, oldRoles, newRoles) => {
	let externalChatRoles = [];

	try {
		externalChatRoles = JSON.parse(
			settings.get('API_External_Chat_User_Roles')
		);
	} catch (err) {
		logger.error('Error parsing API_External_Chat_User_Roles. Using [].');
	}

	oldRoles = oldRoles.filter(role => externalChatRoles.includes(role));
	newRoles = newRoles.filter(role => externalChatRoles.includes(role));

	const removedRoles = oldRoles.filter(role => !newRoles.includes(role));
	const addedRoles = newRoles.filter(role => !oldRoles.includes(role));

	decDestinationsByRoleChange(userId, removedRoles);
	incDestinationsByRoleChange(userId, addedRoles);
};
