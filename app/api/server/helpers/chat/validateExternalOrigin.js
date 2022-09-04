import { API } from '../../api';
import { Meteor } from 'meteor/meteor';
import { settings } from '../../../../settings/server';

API.helperMethods.set(
	'validateExternalOrigin',
	function _validateExternalOrigin(proxyRole, fromUser, room) {
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
				{ helperMethod: 'validateExternalOrigin' }
			);
		}

		const hasCorrectOriginRole = role =>
			role === proxyRole ||
			(externalChatRoles.includes(role) && role.includes(originChat));

		const roomHasCorrectOriginRole = role =>
			room.destinations &&
			room.destinations[role] &&
			hasCorrectOriginRole(role);

		const isUserFromCorrectOrigin =
			fromUser.roles.some(hasCorrectOriginRole);

		if (!isUserFromCorrectOrigin) {
			throw new Meteor.Error(
				'error-invalid-user',
				`User ${fromUser.username} must have ${originChat} role.`
			);
		}

		const doesRoomHaveCorrectDestination =
			room.destinations &&
			Object.keys(room.destinations).some(roomHasCorrectOriginRole);

		if (!doesRoomHaveCorrectDestination) {
			throw new Meteor.Error(
				'error-invalid-room',
				`Room must have ${originChat} destination.`
			);
		}
	}
);
