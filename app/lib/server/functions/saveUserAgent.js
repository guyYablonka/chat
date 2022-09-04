import { Meteor } from 'meteor/meteor';
import { settings } from '../../../settings/index';
import { Logger } from '../../../logger';
import _ from 'underscore';
import { Users } from '../../../models/server';

const logger = new Logger('saveUserAgent', {}, __filename);
const defaultMaxUserAgents = 3;
const NOT_EXISTS = -1;

const handleUserAgents = (userAgentByType, newUserAgent) => {
	const indexOfUserAgent = userAgentByType
		.map(agent => agent.value)
		.indexOf(newUserAgent);
	if (indexOfUserAgent !== NOT_EXISTS) {
		userAgentByType[indexOfUserAgent].date = new Date();
	} else {
		const limit = getLimitUserAgents();
		if (userAgentByType.length >= limit) {
			removeOldestAgent(userAgentByType);
		}
		userAgentByType.push({ value: newUserAgent, date: new Date() });
	}
};

const getLimitUserAgents = () => {
	let maxUserAgents = settings.get('Accounts_UserAgentsLimit');
	if (maxUserAgents <= 0) {
		maxUserAgents = defaultMaxUserAgents;
	}
	return maxUserAgents;
};

const removeOldestAgent = userAgentByType => {
	const onlyDatesArray = userAgentByType.map(agent => agent.date.getTime());
	const oldestDate = onlyDatesArray.reduce((date1, date2) =>
		Math.min(date1, date2)
	);
	const oldestIndex = onlyDatesArray.indexOf(oldestDate);
	userAgentByType.splice(oldestIndex, 1);
};

export const saveUserAgent = (user, newUserAgent) => {
	const { web = [], mobile = [] } = user?.customFields?.userAgents || {};
	const userAgentLowerCase = newUserAgent.toLowerCase();
	let agentType;

	if (userAgentLowerCase.includes('mozilla')) {
		agentType = web;
	} else if (userAgentLowerCase.includes('android')) {
		agentType = mobile;
	}

	if (agentType) {
		handleUserAgents(agentType, newUserAgent);
		const fieldsToUpdate = { userAgents: { web: web, mobile: mobile } };
		Users.setCustomFields(user._id, fieldsToUpdate);
	} else {
		logger.info(
			`the user ${user.username} logged in with unknown user agent - ${newUserAgent}`
		);
	}
};
