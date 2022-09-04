import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { OAuth } from 'meteor/oauth';
import { HTTP } from 'meteor/http';
import { ServiceConfiguration } from 'meteor/service-configuration';
import _ from 'underscore';

import {
	normalizers,
	fromTemplate,
	renameInvalidProperties
} from './transform_helpers';
import {
	mapRolesFromSSO,
	mapSSOGroupsToChannels,
	updateRolesFromSSO
} from './oauth_helpers';
import { Logger } from '../../logger';
import { Users } from '../../models';
import { isURL } from '../../utils/lib/isURL';
import { registerAccessTokenService } from '../../lib/server/oauth/oauth';

const logger = new Logger('CustomOAuth', {}, __filename);

const Services = {};
const BeforeUpdateOrCreateUserFromExternalService = [];

const cutUsername = username => {
	return username.split('@')[0];
};

export class CustomOAuth {
	constructor(name, options) {
		logger.info('Init CustomOAuth', { name, options });

		this.name = name;
		if (!Match.test(this.name, String)) {
			throw new Meteor.Error(
				'CustomOAuth: Name is required and must be String'
			);
		}

		if (Services[this.name]) {
			Services[this.name].configure(options);
			return;
		}

		Services[this.name] = this;

		this.configure(options);

		this.userAgent = 'Meteor';
		if (Meteor.release) {
			this.userAgent += `/${Meteor.release}`;
		}

		Accounts.oauth.registerService(this.name);
		this.registerService();
		this.addHookToProcessUser();
		this.registerAccessTokenService(this.name, this.accessTokenParam);
	}

	configure(options) {
		if (!Match.test(options, Object)) {
			throw new Meteor.Error(
				'CustomOAuth: Options is required and must be Object'
			);
		}

		if (!Match.test(options.serverURL, String)) {
			throw new Meteor.Error(
				'CustomOAuth: Options.serverURL is required and must be String'
			);
		}

		if (!Match.test(options.tokenPath, String)) {
			options.tokenPath = '/oauth/token';
		}

		if (!Match.test(options.identityPath, String)) {
			options.identityPath = '/me';
		}

		if (!Match.test(options.accessTokenParam, String)) {
			options.accessTokenParam = 'access_token';
		}

		this.serverURL = options.serverURL;
		this.tokenPath = options.tokenPath;
		this.identityPath = options.identityPath;
		this.tokenSentVia = options.tokenSentVia;
		this.redirectUri = options.redirectUri;
		this.identityTokenSentVia = options.identityTokenSentVia;
		this.scope = options.scope || 'openid email profile';
		this.usernameField = (options.usernameField || '').trim();
		this.emailField = (options.emailField || '').trim();
		this.nameField = (options.nameField || '').trim();
		this.avatarField = (options.avatarField || '').trim();
		this.mergeUsers = options.mergeUsers;
		this.mergeRoles = options.mergeRoles || false;
		this.mapChannels = options.mapChannels || false;
		this.rolesClaim = options.rolesClaim || 'roles';
		this.groupsClaim = options.groupsClaim || 'groups';
		this.accessTokenParam = options.accessTokenParam;
		this.channelsAdmin = options.channelsAdmin || 'rocket.cat';

		if (this.mapChannels) {
			const channelsMap = (options.channelsMap || '{}').trim();
			try {
				this.channelsMap = JSON.parse(channelsMap);
			} catch (err) {
				logger.error(`Unexpected error : ${err.message}`);
			}
		}

		if (
			this.identityTokenSentVia == null ||
			this.identityTokenSentVia === 'default'
		) {
			this.identityTokenSentVia = this.tokenSentVia;
		}

		if (!isURL(this.tokenPath)) {
			this.tokenPath = this.serverURL + this.tokenPath;
		}

		if (!isURL(this.identityPath)) {
			this.identityPath = this.serverURL + this.identityPath;
		}

		if (Match.test(options.addAutopublishFields, Object)) {
			Accounts.addAutopublishFields(options.addAutopublishFields);
		}
	}

	overrideOptionsByEnv() {
		const webAuthName = 'oidc';

		if (this.name.toLowerCase() === webAuthName) {
			const newServerUrl = process.env.WEB_AUTH_URL;

			this.tokenPath = this.tokenPath.replace(
				this.serverURL,
				newServerUrl
			);
			this.identityPath = this.identityPath.replace(
				this.serverURL,
				newServerUrl
			);

			this.serverURL = newServerUrl;
		}
	}

	authenticate(query) {
		this.overrideOptionsByEnv();

		logger.info(`Authenticating with ${this.name}, using:`, {
			serverURL: this.serverURL,
			tokenPath: this.tokenPath,
			identityPath: this.identityPath
		});

		const {
			access_token: accessToken,
			id_token: idToken,
			refresh_token: refreshToken,
			expires_in: expiresIn
		} = this.getAccessToken(query);

		const identity = this.getIdentity(accessToken);

		const serviceData = {
			serviceName: this.name,
			serverURL: this.serverURL,
			_OAuthCustom: true,
			expiresIn,
			accessToken,
			idToken,
			expiresAt: +new Date() + 1000 * parseInt(expiresIn, 10)
		};

		if (refreshToken) {
			serviceData.refreshToken = refreshToken;
		}

		_.extend(serviceData, identity);

		const data = {
			serviceData,
			options: {
				profile: {
					name:
						identity.name ||
						identity.username ||
						identity.nickname ||
						identity.CharacterName ||
						identity.userName ||
						identity.preferred_username ||
						(identity.user && identity.user.name) ||
						serviceData[this.nameField]
				}
			}
		};

		return data;
	}

	getAccessToken(query) {
		const config = ServiceConfiguration.configurations.findOne({
			service: this.name
		});
		if (!config) {
			throw new ServiceConfiguration.ConfigError();
		}

		let response = undefined;

		const allOptions = {
			headers: {
				'User-Agent': this.userAgent, // http://doc.gitlab.com/ce/api/users.html#Current-user
				Accept: 'application/json'
			},
			params: {
				code: query.code,
				code_verifier: query.code_verifier,
				redirect_uri:
					this.redirectUri ||
					config.redirectUri ||
					OAuth._redirectUri(this.name, config),
				scope: this.scope,
				grant_type: 'authorization_code',
				state: query.state
			}
		};

		// Only send clientID / secret once on header or payload.
		if (this.tokenSentVia === 'header') {
			allOptions.auth = `${config.clientId}:${OAuth.openSecret(
				config.secret
			)}`;
		} else {
			allOptions.params.client_secret =
				OAuth.openSecret(config.secret) ?? '';
			allOptions.params.client_id = config.clientId;
		}

		try {
			response = HTTP.post(this.tokenPath, allOptions);
		} catch (err) {
			const error = new Error(
				`Failed to complete OAuth handshake with ${this.name} at ${this.tokenPath}, with oAuth Option: ${allOptions.params}. ${err.message}`
			);
			throw _.extend(error, { response: err.response });
		}

		const data = response.data || JSON.parse(response.content);

		if (data.error) {
			// if the http response was a json object with an error attribute
			throw new Error(
				`Failed to complete OAuth handshake with ${this.name} at ${this.tokenPath},with oAuth Option: ${allOptions.params}. ${data.error}`
			);
		} else {
			logger.info(`Recieved access token through ${this.name} service:`, {
				data
			});
			return data;
		}
	}

	getIdentity(accessToken) {
		const params = {};
		const headers = {
			'User-Agent': this.userAgent, // http://doc.gitlab.com/ce/api/users.html#Current-user
			Accept: 'application/json'
		};

		if (this.identityTokenSentVia === 'header') {
			headers.Authorization = `Bearer ${accessToken}`;
		} else {
			params[this.accessTokenParam] = accessToken;
		}

		try {
			const response = HTTP.get(this.identityPath, {
				headers,
				params
			});

			const data = response.data || JSON.parse(response.content);

			logger.info(`Recieved identity through ${this.name} service:`, {
				...data
			});

			return this.normalizeIdentity(data);
		} catch (err) {
			const error = new Error(
				`Failed to fetch identity from ${this.name} at ${this.identityPath}. ${err.message}`
			);
			throw _.extend(error, { response: err.response });
		}
	}

	registerService() {
		const self = this;
		OAuth.registerService(this.name, 2, null, query => {
			const response = self.getAccessToken(query);
			const identity = self.getIdentity(response.access_token);

			const serviceData = {
				_OAuthCustom: true,
				serverURL: self.serverURL,
				accessToken: response.access_token,
				idToken: response.id_token,
				expiresAt:
					+new Date() + 1000 * parseInt(response.expires_in, 10)
			};

			// only set the token in serviceData if it's there. this ensures
			// that we don't lose old ones (since we only get this on the first
			// log in attempt)
			if (response.refresh_token) {
				serviceData.refreshToken = response.refresh_token;
			}

			_.extend(serviceData, identity);

			const data = {
				serviceData,
				options: {
					profile: {
						name: identity.name
					}
				}
			};

			return data;
		});
	}

	normalizeIdentity(identity) {
		if (identity) {
			for (const normalizer of Object.values(normalizers)) {
				const result = normalizer(identity);
				if (result) {
					identity = result;
				}
			}
		}

		if (this.usernameField) {
			identity.username = cutUsername(this.getUsername(identity));
		}

		if (this.emailField) {
			identity.email = this.getEmail(identity);
		}

		if (this.nameField) {
			identity.name = this.getCustomName(identity);
		} else {
			identity.name = this.getName(identity);
		}

		return renameInvalidProperties(identity);
	}

	retrieveCredential(credentialToken, credentialSecret) {
		return OAuth.retrieveCredential(credentialToken, credentialSecret);
	}

	getUsername(data) {
		try {
			const value = fromTemplate(this.usernameField, data);

			if (!value) {
				throw new Meteor.Error(
					'field_not_found',
					`Username field "${this.usernameField}" not found in data`,
					data
				);
			}
			return value;
		} catch (error) {
			throw new Error(
				'CustomOAuth: Failed to extract username',
				error.message
			);
		}
	}

	getEmail(data) {
		try {
			const value = fromTemplate(this.emailField, data);

			if (!value) {
				throw new Meteor.Error(
					'field_not_found',
					`Email field "${this.emailField}" not found in data`,
					data
				);
			}
			return value;
		} catch (error) {
			throw new Error(
				'CustomOAuth: Failed to extract email',
				error.message
			);
		}
	}

	getCustomName(data) {
		try {
			const value = fromTemplate(this.nameField, data);

			if (!value) {
				return this.getName(data);
			}

			return value;
		} catch (error) {
			throw new Error(
				'CustomOAuth: Failed to extract custom name',
				error.message
			);
		}
	}

	getName(identity) {
		const name =
			identity.name ||
			identity.username ||
			identity.nickname ||
			identity.CharacterName ||
			identity.userName ||
			identity.preferred_username ||
			identity.user?.name;
		return name;
	}

	addHookToProcessUser() {
		BeforeUpdateOrCreateUserFromExternalService.push(
			(serviceName, serviceData /* , options*/) => {
				if (serviceName !== this.name) {
					return;
				}

				if (serviceData.username) {
					const user = Users.findOneByUsernameIgnoringCase(
						serviceData.username
					);
					if (!user) {
						return;
					}

					if (this.mergeRoles) {
						updateRolesFromSSO(user, serviceData, this.rolesClaim);
					}

					if (this.mapChannels) {
						mapSSOGroupsToChannels(
							user,
							serviceData,
							this.groupsClaim,
							this.channelsMap,
							this.channelsAdmin
						);
					}

					// User already created or merged and has identical name as before
					if (
						user.services &&
						user.services[serviceName] &&
						user.services[serviceName].id === serviceData.id &&
						user.name === serviceData.name
					) {
						return;
					}

					if (this.mergeUsers !== true) {
						throw new Meteor.Error(
							'CustomOAuth',
							`User with username ${user.username} already exists`
						);
					}

					const serviceIdKey = `services.${serviceName}.id`;
					const update = {
						$set: {
							name: serviceData.name,
							[serviceIdKey]: serviceData.id
						}
					};

					logger.info(`updating user`, {
						username: user.username,
						id: user._id,
						serviceName: serviceData.name,
						[serviceIdKey]: serviceData.id
					});

					Users.update({ _id: user._id }, update);
				}
			}
		);

		Accounts.validateNewUser(user => {
			if (
				!user.services ||
				!user.services[this.name] ||
				!user.services[this.name].id
			) {
				return true;
			}

			if (this.usernameField) {
				user.username = cutUsername(user.services[this.name].username);
			}

			if (this.emailField) {
				user.email = user.services[this.name].email;
			}

			if (this.nameField) {
				user.name = user.services[this.name].name;
			}

			if (this.mergeRoles) {
				user.roles = mapRolesFromSSO(
					user.services[this.name],
					this.rolesClaim
				);
			}

			if (this.mapChannels) {
				mapSSOGroupsToChannels(
					user,
					user.services[this.name],
					this.groupsClaim,
					this.channelsMap,
					this.channelsAdmin
				);
			}

			return true;
		});
	}

	registerAccessTokenService(name) {
		const self = this;
		const whitelisted = [
			'id',
			'email',
			'username',
			'name',
			this.rolesClaim
		];

		registerAccessTokenService(name, function (options) {
			check(
				options,
				Match.ObjectIncluding({
					accessToken: String,
					expiresIn: Match.Integer
				})
			);

			self.overrideOptionsByEnv();

			logger.info(
				`Pulling identity with ${self.name}, using serverURL:`,
				self.serverURL,
				', tokenPath:',
				self.tokenPath,
				', identityPath:',
				self.identityPath
			);

			const identity = self.getIdentity(options.accessToken);

			const serviceData = {
				accessToken: options.accessToken,
				expiresAt: +new Date() + 1000 * parseInt(options.expiresIn, 10)
			};

			const fields = _.pick(identity, whitelisted);
			_.extend(serviceData, fields);

			return {
				serviceData,
				options: {
					profile: {
						name: identity.name
					}
				}
			};
		});
	}
}

const { updateOrCreateUserFromExternalService } = Accounts;
Accounts.updateOrCreateUserFromExternalService = function (
	...args /* serviceName, serviceData, options*/
) {
	logger.info(
		`running ${BeforeUpdateOrCreateUserFromExternalService.length} hooks before creating or updating the user`
	);
	for (const hook of BeforeUpdateOrCreateUserFromExternalService) {
		hook.apply(this, args);
	}

	return updateOrCreateUserFromExternalService.apply(this, args);
};
