import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import _ from 'underscore';

import * as Mailer from '../../../mailer/server/api';
import { settings } from '../../../settings/server';
import { callbacks } from '../../../callbacks/server';
import { Users, Settings } from '../../../models/server';
import { addUserRoles } from '../../../authorization/server';
import { getAvatarSuggestionForUser } from '../../../lib/server/functions';
import {
	isValidAttemptByUser,
	isValidLoginAttemptByIp
} from '../lib/restrictLoginAttempts';
import './settings';
import { getClientAddress } from '../../../../server/lib/getClientAddress';
import { escapeHTML } from '../../../../lib/escapeHTML';
import { escapeRegExp } from '../../../../lib/escapeRegExp';
import { saveUserAgent } from '../../../lib/index';
import { usersService } from '../../../lib/index';
import { Logger } from '../../../logger/server';
const logger = new Logger('authentication', {}, __filename);

const mobileAuthServiceName = settings.get(
	'Accounts_OAuth_MobileAuth_serviceName'
);

let agentToServiceMap;

const getServiceNameByUserAgent = (userAgent = '') => {
	const desiredKey = Object.keys(agentToServiceMap).find(key =>
		userAgent.includes(key)
	);
	return desiredKey && agentToServiceMap[desiredKey];
};

const usersServiceHandler = (user, userAgent) => {
	const externalServiceName = getServiceNameByUserAgent(userAgent);

	if (user.services[externalServiceName]?.displayName) {
		usersService.post({
			userId: user._id,
			upn: user.services[externalServiceName].UPN,
			displayName: user.services[externalServiceName].displayName,
			FirstName: user.services[externalServiceName].given_name,
			LastName: user.services[externalServiceName].family_name
		});

		logger.info(
			`Successfully fetch data from users service for user ${user.username}, by service ${externalServiceName}`
		);
	}
};

Accounts.config({
	forbidClientAccountCreation: true
});

const updateMailConfig = _.debounce(() => {
	Accounts._options.loginExpirationInDays = settings.get(
		'Accounts_LoginExpiration'
	);

	Accounts.emailTemplates.siteName = settings.get('Site_Name');

	Accounts.emailTemplates.from = `${settings.get(
		'Site_Name'
	)} <${settings.get('From_Email')}>`;
}, 1000);

Meteor.startup(() => {
	settings.get(
		/^(Accounts_LoginExpiration|Site_Name|From_Email)$/,
		updateMailConfig
	);

	settings.get('Users_Service_Agent_To_Service', (key, value) => {
		try {
			agentToServiceMap = JSON.parse(value);
			logger.info('User agents map loaded successfully');
		} catch (e) {
			agentToServiceMap = {
				Mozilla: 'oidc',
				Android: mobileAuthServiceName
			};
			logger.error('Could not load agentToServiceMap, will use: ', {
				agentToServiceMap
			});
		}
	});

	usersService.init();
});

Accounts.emailTemplates.userToActivate = {
	subject() {
		const subject = TAPi18n.__(
			'Accounts_Admin_Email_Approval_Needed_Subject_Default'
		);
		const siteName = settings.get('Site_Name');

		return `[${siteName}] ${subject}`;
	},

	html(options = {}) {
		const email = options.reason
			? 'Accounts_Admin_Email_Approval_Needed_With_Reason_Default'
			: 'Accounts_Admin_Email_Approval_Needed_Default';

		return Mailer.replace(TAPi18n.__(email), {
			name: escapeHTML(options.name),
			email: escapeHTML(options.email),
			reason: escapeHTML(options.reason)
		});
	}
};

Accounts.emailTemplates.userActivated = {
	subject({ active, username }) {
		const activated = username ? 'Activated' : 'Approved';
		const action = active ? activated : 'Deactivated';
		const subject = `Accounts_Email_${action}_Subject`;
		const siteName = settings.get('Site_Name');

		return `[${siteName}] ${TAPi18n.__(subject)}`;
	},

	html({ active, name, username }) {
		const activated = username ? 'Activated' : 'Approved';
		const action = active ? activated : 'Deactivated';

		return Mailer.replace(TAPi18n.__(`Accounts_Email_${action}`), {
			name: escapeHTML(name)
		});
	}
};

let verifyEmailTemplate = '';
let enrollAccountTemplate = '';
let resetPasswordTemplate = '';
Meteor.startup(() => {
	Mailer.getTemplateWrapped('Verification_Email', value => {
		verifyEmailTemplate = value;
	});
	Mailer.getTemplateWrapped('Accounts_Enrollment_Email', value => {
		enrollAccountTemplate = value;
	});
	Mailer.getTemplateWrapped('Forgot_Password_Email', value => {
		resetPasswordTemplate = value;
	});
});

Accounts.emailTemplates.verifyEmail.html = function (userModel, url) {
	return Mailer.replace(verifyEmailTemplate, {
		Verification_Url: url,
		name: userModel.name
	});
};

Accounts.emailTemplates.verifyEmail.subject = function () {
	const subject = settings.get('Verification_Email_Subject');
	return Mailer.replace(subject || '');
};

Accounts.urls.resetPassword = function (token) {
	return Meteor.absoluteUrl(`reset-password/${token}`);
};

Accounts.emailTemplates.resetPassword.subject = function (userModel) {
	return Mailer.replace(settings.get('Forgot_Password_Email_Subject') || '', {
		name: userModel.name
	});
};

Accounts.emailTemplates.resetPassword.html = function (userModel, url) {
	return Mailer.replacekey(
		Mailer.replace(resetPasswordTemplate, {
			name: userModel.name
		}),
		'Forgot_Password_Url',
		url
	);
};

Accounts.emailTemplates.enrollAccount.subject = function (user) {
	const subject = settings.get('Accounts_Enrollment_Email_Subject');
	return Mailer.replace(subject, user);
};

Accounts.emailTemplates.enrollAccount.html = function (user = {} /* , url*/) {
	return Mailer.replace(enrollAccountTemplate, {
		name: escapeHTML(user.name),
		email:
			user.emails && user.emails[0] && escapeHTML(user.emails[0].address)
	});
};

Accounts.insertUserDoc = _.wrap(
	Accounts.insertUserDoc,
	function (insertUserDoc, options, user) {
		let roles = [];

		if (
			Match.test(user.globalRoles, [String]) &&
			user.globalRoles.length > 0
		) {
			roles = roles.concat(user.globalRoles);
		}

		delete user.globalRoles;

		if (user.services && !user.services.password) {
			const defaultAuthServiceRoles = String(
				settings.get(
					'Accounts_Registration_AuthenticationServices_Default_Roles'
				)
			).split(',');
			if (defaultAuthServiceRoles.length > 0) {
				roles = roles.concat(
					defaultAuthServiceRoles.map(s => s.trim())
				);
			}
		}

		if (!user.type) {
			user.type = 'user';
		}

		if (
			settings.get(
				'Accounts_TwoFactorAuthentication_By_Email_Auto_Opt_In'
			)
		) {
			user.services = user.services || {};
			user.services.email2fa = {
				enabled: true,
				changedAt: new Date()
			};
		}

		const _id = insertUserDoc.call(Accounts, options, user);

		user = Meteor.users.findOne({
			_id
		});

		if (user.username) {
			if (
				options.joinDefaultChannels !== false &&
				user.joinDefaultChannels !== false
			) {
				Meteor.runAsUser(_id, function () {
					return Meteor.call(
						'joinDefaultChannels',
						options.joinDefaultChannelsSilenced
					);
				});
			}

			if (user.type !== 'visitor') {
				Meteor.defer(function () {
					return callbacks.run('afterCreateUser', user);
				});
			}
			if (settings.get('Accounts_SetDefaultAvatar') === true) {
				const avatarSuggestions = getAvatarSuggestionForUser(user);
				Object.keys(avatarSuggestions).some(service => {
					const avatarData = avatarSuggestions[service];
					Meteor.runAsUser(_id, function () {
						return Meteor.call(
							'setAvatarFromService',
							avatarData.blob,
							'',
							service
						);
					});
					return true;
				});
			}
		}

		if (roles.length === 0) {
			const hasAdmin = Users.findOne(
				{
					roles: 'admin',
					type: 'user'
				},
				{
					fields: {
						_id: 1
					}
				}
			);

			if (hasAdmin) {
				roles.push('user');
			} else {
				roles.push('admin');
				if (settings.get('Show_Setup_Wizard') === 'pending') {
					Settings.updateValueById(
						'Show_Setup_Wizard',
						'in_progress'
					);
				}
			}
		}

		addUserRoles(_id, roles);

		return _id;
	}
);

Accounts.validateLoginAttempt(function (login) {
	login = callbacks.run('beforeValidateLogin', login);

	if (
		!Promise.await(
			isValidLoginAttemptByIp(getClientAddress(login.connection))
		)
	) {
		throw new Meteor.Error(
			'error-login-blocked-for-ip',
			'Login has been temporarily blocked For IP',
			{
				function: 'Accounts.validateLoginAttempt'
			}
		);
	}

	if (!Promise.await(isValidAttemptByUser(login))) {
		throw new Meteor.Error(
			'error-login-blocked-for-user',
			'Login has been temporarily blocked For User',
			{
				function: 'Accounts.validateLoginAttempt'
			}
		);
	}

	if (login.allowed !== true) {
		return login.allowed;
	}

	if (login.user.type === 'visitor') {
		return true;
	}

	if (login.user.type === 'app') {
		throw new Meteor.Error(
			'error-app-user-is-not-allowed-to-login',
			'App user is not allowed to login',
			{
				function: 'Accounts.validateLoginAttempt'
			}
		);
	}

	if (!!login.user.active !== true) {
		throw new Meteor.Error(
			'error-user-is-not-activated',
			'User is not activated',
			{
				function: 'Accounts.validateLoginAttempt'
			}
		);
	}

	if (!login.user.roles || !Array.isArray(login.user.roles)) {
		throw new Meteor.Error('error-user-has-no-roles', 'User has no roles', {
			function: 'Accounts.validateLoginAttempt'
		});
	}

	if (
		login.user.roles.includes('admin') === false &&
		login.type === 'password' &&
		settings.get('Accounts_EmailVerification') === true
	) {
		const validEmail = login.user.emails.filter(
			email => email.verified === true
		);
		if (validEmail.length === 0) {
			throw new Meteor.Error(
				'error-invalid-email',
				'Invalid email __email__'
			);
		}
	}

	login = callbacks.run('onValidateLogin', login);
	const user = login.user;

	if (login?.connection?.httpHeaders?.['user-agent']) {
		const userAgent = login.connection.httpHeaders['user-agent'];
		saveUserAgent(user, userAgent);

		if (settings.get('Users_Service_Enabled')) {
			logger.info(
				`Getting data from users service for user ${user.username}, with method ${login.methodName}`,
				{
					connection: login.connection,
					sessionId: login.id,
					username: user.username
				}
			);
			usersServiceHandler(user, userAgent);
		}
	}

	Users.updateLastLoginById(user._id);
	Meteor.defer(function () {
		return callbacks.run('afterValidateLogin', login);
	});

	return true;
});

Accounts.validateNewUser(function (user) {
	if (user.type === 'visitor') {
		return true;
	}

	if (
		settings.get('Accounts_Registration_AuthenticationServices_Enabled') ===
			false &&
		settings.get('LDAP_Enable') === false &&
		!(user.services && user.services.password)
	) {
		throw new Meteor.Error(
			'registration-disabled-authentication-services',
			'User registration is disabled for authentication services'
		);
	}

	return true;
});

Accounts.validateNewUser(function (user) {
	if (user.type === 'visitor') {
		return true;
	}

	let domainWhiteList = settings.get('Accounts_AllowedDomainsList');
	if (_.isEmpty(domainWhiteList?.trim())) {
		return true;
	}

	domainWhiteList = domainWhiteList.split(',').map(domain => domain.trim());

	if (user.emails && user.emails.length > 0) {
		const email = user.emails[0].address;
		const inWhiteList = domainWhiteList.some(domain =>
			email.match(`@${escapeRegExp(domain)}$`)
		);

		if (inWhiteList === false) {
			throw new Meteor.Error('error-invalid-domain');
		}
	}

	return true;
});

Accounts.onLogin(async ({ user }) => {
	Users.limitLoginTokens(user._id);
});
