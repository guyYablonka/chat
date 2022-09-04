import { Logger } from '/app/logger/server';
import { settings } from '/app/settings/server';

const logger = new Logger('UserActionOrigin', {}, __filename);
let defaultClient = 'unknown';
let isUserActionEnable = false;
let userActionsMap = {};

settings.get('User_Action_Enabled', (key, value) => {
	isUserActionEnable = value;
});

settings.get('User_Action_Regex_To_From', (key, value) => {
	try {
		userActionsMap = JSON.parse(value);
	} catch (e) {
		logger.error('Could not load regexToFromMAP');
	}
});

settings.get('User_Default_Agent', (key, value) => {
	defaultClient = value;
});

// The context is only available from Meteor methods, so you must call this function from there.
export const getUserActionOrigin = context => {
	if (!isUserActionEnable) {
		return defaultClient;
	}
	const userAgent =
		context?.connection?.httpHeaders?.['user-agent'] ||
		context?.request?.headers?.['user-agent'];

	return convertUserAgentToFrom(userAgent);
};

const convertUserAgentToFrom = userAgent => {
	const regex = Object.keys(userActionsMap).find(regex =>
		new RegExp(regex, 'i').test(userAgent)
	);

	return userActionsMap[regex] ?? defaultClient;
};
