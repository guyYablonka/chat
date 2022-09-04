import { settings } from '../../../../settings/server';
import { Users } from '../../../../models/index';
import { Logger } from '/app/logger/server';
import createAxios from '../../lib/createAxios';
const logger = new Logger('usersService', {}, __filename);

let axiosServiceInstance;
let shouldUseUsersService;
let urlToConnect;
let connected = false;

const connect = () => {
	logger.info('Users service is Activated by settings');

	if (!urlToConnect) {
		throw Meteor.Error(`No url provided for users service`);
	}

	try {
		axiosServiceInstance = createAxios({
			baseURL: urlToConnect,
			timeout: 45000
		});

		logger.info(`connect to ${urlToConnect}.`);
		connected = true;
	} catch (err) {
		logger.error(`Connection to ${urlToConnect} failed. err: `, {
			err
		});
		connected = false;
	}
};

const post = data => {
	if (shouldUseUsersService && connected) {
		logger.info('users service post ', { data });
		const { userId, upn, displayName, FirstName, LastName } = data;
		const user = Users.findOneById(userId);

		const logPrefix = `Request to Users Service (${urlToConnect}) for ${userId}`;

		const reqData = {
			userId,
			upn,
			displayName,
			FirstName,
			LastName,
			customFields: user.customFields || {},
			roles: user.roles || []
		};

		logger.info(logPrefix, { reqData });

		axiosServiceInstance
			.post('/userChatAuth', reqData)
			.then(() => {
				logger.info(`${logPrefix} has been sent successfuly`);
			})
			.catch(err => logger.error(`${logPrefix} failed!`, { err }));
	}
};

const init = () => {
	settings.get('Users_Service_Enabled', (key, value) => {
		shouldUseUsersService = value;
		urlToConnect = settings.get('Users_Service_Url');
		if (value) {
			connect();
		} else {
			connected = false;
		}
	});
};

export const usersService = {
	post,
	init
};
