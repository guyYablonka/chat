import { API } from '../api';
import { Meteor } from 'meteor/meteor';
import { Users } from '../../../models';
import { settings } from '../../../settings/server';

API.helperMethods.set('isProxyBot', function _isProxyBot() {
	let proxyBotRoles = [];

	const user = Users.findOneById(this.userId);

	try {
		proxyBotRoles = JSON.parse(
			settings.get('API_External_Chat_Proxy_Roles')
		);
	} catch (err) {
		throw new Meteor.Error(
			'error-get-extenal-roles',
			`Error parsing API_External_Chat_Proxy_Roles.`,
			{ helperMethod: 'isProxyBot' }
		);
	}

	const proxyBot = proxyBotRoles.find(role => user.roles.includes(role));

	return proxyBot;
});
