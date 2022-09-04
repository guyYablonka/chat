import axiosRetry from 'axios-retry';
import createAxios from '../../lib/createAxios';
import { Logger } from '../../../../logger/server';

const logger = new Logger('serviceSender', {}, __filename);

const writerName = 'Service Sender';

let axiosServiceInstance;

const connect = async urlsToConnect => {
	if (!urlsToConnect || !urlsToConnect[0]) {
		throw Meteor.Error(`No url provided`);
	}

	const serviceUrl = urlsToConnect[0];

	axiosServiceInstance = createAxios({
		baseURL: serviceUrl,
		timeout: 45000
	});

	axiosRetry(axiosServiceInstance, {
		retries: 2,
		shouldResetTimeout: true,
		retryCondition: _error => {
			const { config, code } = _error;
			logger.warn(
				'Failed to write request, retrying',
				code,
				config.data,
				config['axios-retry']
			);
			return true;
		}
	});

	logger.info(`connection to ${serviceUrl} established.`);
};

const write = async (destination, methodName, body) => {
	const ts = Date.now();
	const logPrefix = `Request to write (ts: ${ts}, topic: ${destination}, method: ${methodName}, body: ${JSON.stringify(
		body
	)})`;

	axiosServiceInstance
		.post('write', {
			ts,
			topic: destination,
			methodName,
			body
		})
		.then(() => {
			logger.info(`${logPrefix} has been sent successfuly`);
		})
		.catch(err => {
			logger.error(`${logPrefix} failed! err`, { err });
		});
};

module.exports = {
	connect,
	write,
	name: writerName
};
