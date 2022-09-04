import _ from 'underscore';
import { settings } from '../../../settings/server';
import { Logger } from '../../../logger/server';
import { CustomOAuth } from '../../../custom-oauth';

import notifications from '/app/notifications/server/lib/Notifications';
import { Users, Roles } from '/app/models/server';

const logger = new Logger('MobileAuthenticate', {}, __filename);

const getFromSettings = field => {
	return settings.get(`Accounts_OAuth_MobileAuth_${field}`);
};

const addRole = (username, roleName) => {
	if (!roleName || !_.isString(roleName) || !_.isString(username)) {
		throw new Meteor.Error('error-invalid-arguments', 'Invalid arguments', {
			method: 'mobileAuthenticate',
			roleName,
			username
		});
	}

	const user = Users.findOneByUsername(username, {
		fields: {
			_id: 1,
			roles: 1
		}
	});

	if (!user || !user._id) {
		throw new Meteor.Error('error-invalid-user', 'Invalid user', {
			method: 'mobileAuthenticate',
			username
		});
	}

	const role = Roles.findOneByIdOrName(roleName, {});

	if (!role) {
		throw new Meteor.Error('error-invalid-role', 'Non-existing role', {
			method: 'mobileAuthenticate',
			roleName
		});
	}

	Roles.addUserRoles(user._id, roleName);

	if (settings.get('UI_DisplayRoles')) {
		notifications.notifyLoggedInThisInstance('roles-change', {
			type: 'added',
			_id: roleName,
			u: {
				_id: user._id,
				username
			}
		});
	}
};

Meteor.methods({
	mobileAuthenticate(query) {
		const config = {
			serverURL: process.env.MOBILE_AUTH_URL || getFromSettings('URL'),
			authorizePath: getFromSettings('authorizationPath'),
			tokenPath: getFromSettings('tokenPath'),
			identityPath: getFromSettings('identityPath'),
			scope: getFromSettings('scope'),
			redirectUri: getFromSettings('callback_url'),
			usernameField: getFromSettings('usernameField'),
			nameField: getFromSettings('nameField'),
			accessTokenParam: getFromSettings('accessTokenParam'),
			tokenSentVia: settings.get(
				'Accounts_OAuth_Custom-MobileAuth-token_sent_via'
			),
			identityTokenSentVia: settings.get(
				'Accounts_OAuth_Custom-MobileAuth-identity_token_sent_via'
			),
			mergeUsers: getFromSettings('merge_users')
		};

		const serviceName = getFromSettings('serviceName');

		logger.info(`For ${serviceName} using auth url`, config.serverURL);

		const mobileAuth = new CustomOAuth(serviceName, config);
		mobileAuth.configure(config);
		mobileAuth.registerAccessTokenService(
			serviceName,
			config.accessTokenParam
		);

		let authResponse;
		try {
			authResponse = mobileAuth.authenticate({
				code: query.serverAuthCode,
				code_verifier: query.codeVerifier
			});

			logger.info(
				`User ${authResponse.serviceData.username} is now authenticated`
			);

			const options = {
				profile: {
					name: authResponse.serviceData[config.nameField]
				}
			};

			Accounts.updateOrCreateUserFromExternalService(
				serviceName,
				authResponse.serviceData,
				options
			);

			logger.info(
				`User ${authResponse.serviceData.username} has been updated or created`
			);

			const mobileUserRoleName = getFromSettings('roleName');

			if (mobileUserRoleName) {
				addRole(authResponse.serviceData.username, mobileUserRoleName);
			}

			logger.info(
				`User ${authResponse.serviceData.username} was successfully authenticated by ${serviceName}`
			);
		} catch (err) {
			if (!err || !err.response) {
				const internalServerError = 500;
				_.extend(err, {
					response: {
						statusCode: internalServerError
					}
				});
			}

			logger.error('Error in mobile authentication:', { err });

			return err;
		}

		return authResponse;
	}
});
