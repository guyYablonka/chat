import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { OAuth } from 'meteor/oauth';
import s from 'underscore.string';

import { Utils2fa } from './lib/2fa';
import { process2faReturn } from './callWithTwoFactorRequired';
import { CustomOAuth } from '../../custom-oauth';

let lastCredentialToken = null;
let lastCredentialSecret = null;

Accounts.oauth.tryLoginAfterPopupClosed = function (
	credentialToken,
	callback,
	totpCode,
	credentialSecret = null
) {
	credentialSecret =
		credentialSecret ||
		OAuth._retrieveCredentialSecret(credentialToken) ||
		null;
	const methodArgument = {
		oauth: {
			credentialToken,
			credentialSecret
		}
	};

	lastCredentialToken = credentialToken;
	lastCredentialSecret = credentialSecret;

	if (totpCode && typeof totpCode === 'string') {
		methodArgument.totp = {
			code: totpCode
		};
	}

	Accounts.callLoginMethod({
		methodArguments: [methodArgument],
		userCallback:
			callback &&
			function (err) {
				callback(Utils2fa.convertError(err));
			}
	});
};

Accounts.oauth.credentialRequestCompleteHandler = function (
	callback,
	totpCode
) {
	return function (credentialTokenOrError) {
		if (credentialTokenOrError && credentialTokenOrError instanceof Error) {
			callback && callback(credentialTokenOrError);
		} else {
			Accounts.oauth.tryLoginAfterPopupClosed(
				credentialTokenOrError,
				callback,
				totpCode
			);
		}
	};
};

const createOAuthTotpLoginMethod =
	credentialProvider => (options, code, callback) => {
		// support a callback without options
		if (!callback && typeof options === 'function') {
			callback = options;
			options = null;
		}

		if (lastCredentialToken && lastCredentialSecret) {
			Accounts.oauth.tryLoginAfterPopupClosed(
				lastCredentialToken,
				callback,
				code,
				lastCredentialSecret
			);
		} else {
			const provider =
				(credentialProvider && credentialProvider()) || this;
			const credentialRequestCompleteCallback =
				Accounts.oauth.credentialRequestCompleteHandler(callback, code);
			provider.requestCredential(
				options,
				credentialRequestCompleteCallback
			);
		}

		lastCredentialToken = null;
		lastCredentialSecret = null;
	};

const loginWithOAuthTokenAndTOTP = createOAuthTotpLoginMethod();

Accounts.onPageLoadLogin(loginAttempt => {
	if (loginAttempt?.error?.error !== 'totp-required') {
		return;
	}

	const { methodArguments } = loginAttempt;
	if (!methodArguments?.length) {
		return;
	}

	const oAuthArgs = methodArguments.find(arg => arg.oauth);
	const { credentialToken, credentialSecret } = oAuthArgs.oauth;
	const cb = loginAttempt.userCallback;

	process2faReturn({
		error: loginAttempt.error,
		originalCallback: cb,
		onCode: code => {
			Accounts.oauth.tryLoginAfterPopupClosed(
				credentialToken,
				cb,
				code,
				credentialSecret
			);
		}
	});
});

const oldConfigureLogin = CustomOAuth.prototype.configureLogin;
CustomOAuth.prototype.configureLogin = function (...args) {
	const loginWithService = `loginWith${s.capitalize(this.name)}`;

	oldConfigureLogin.apply(this, args);

	const oldMethod = Meteor[loginWithService];

	Meteor[loginWithService] = function (options, cb) {
		Utils2fa.overrideLoginMethod(
			oldMethod,
			[options],
			cb,
			loginWithOAuthTokenAndTOTP
		);
	};
};
