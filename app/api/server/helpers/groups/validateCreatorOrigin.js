import { API } from '../../api';
import { Meteor } from 'meteor/meteor';
import { settings } from '../../../../settings/server';

API.helperMethods.set(
	'validateCreatorOrigin',
	function _validateCreatorOrigin(proxyRole, creator) {
		let externalChatRoles = [];

		const originChat = proxyRole.split('-')[0];

		try {
			externalChatRoles = JSON.parse(
				settings.get('API_External_Chat_User_Roles')
			);
		} catch (err) {
			throw new Meteor.Error(
				'error-get-extenal-roles',
				`Error parsing API_External_Chat_User_Roles.`,
				{ helperMethod: 'validateCreatorOrigin' }
			);
		}

		const isCorrectOriginRole = role =>
			role === proxyRole ||
			(externalChatRoles.includes(role) && role.includes(originChat));

		const isUserFromCorrectOrigin = creator.roles.some(isCorrectOriginRole);

		if (!isUserFromCorrectOrigin) {
			throw new Meteor.Error(
				'error-invalid-user',
				`User ${creator.username} must have ${originChat} role.`
			);
		}
	}
);
