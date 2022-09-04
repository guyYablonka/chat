import { Meteor } from 'meteor/meteor';
import serviceSender from './serviceSender';
import functionsName from './functionsName';
import getTopicsFromDestinations from './getTopicsFromDestinations';
import { Logger } from '../../../../logger/server';
import { settings } from '../../../../settings/server';

const logger = new Logger('externalWriter', {}, __filename);

const writerToUse = serviceSender;

let isConnectedToWriter = false;

const connect = async (shouldUseExternalWriter, urlsToConnect) => {
	if (!shouldUseExternalWriter) {
		logger.info('Disabled External Writer by settings');
	} else {
		logger.info('Activated External Writer by settings');

		try {
			await writerToUse.connect(urlsToConnect);
			isConnectedToWriter = true;
		} catch (err) {
			logger.error(`Connection to ${writerToUse.name} failed.`, { err });
		}
	}
};

const write = (roomDestinations, methodName, body, extraData = {}) => {
	if (isConnectedToWriter) {
		const topicsByDestinations = getTopicsFromDestinations(
			Object.keys(roomDestinations)
		);

		topicsByDestinations.forEach(currentTopic => {
			const { fromProxy } = extraData;

			// We don't want to send proxys requests they sent to us,
			// So we skip proxys that extraData indicates it's from them

			if (currentTopic !== fromProxy) {
				logger.info(`Writing to ${writerToUse.name}`, {
					topic: currentTopic,
					method: methodName,
					body
				});

				writerToUse.write(currentTopic, methodName, body);
			} else {
				logger.info(`Caught ${methodName} request from ${fromProxy}`);
			}
		});
	}
};

Meteor.startup(() => {
	const shouldUseExternalWriter = settings.get('External_Writing_Enabled');

	const urlsToConnect = settings.get('External_Writing_Urls');
	const splittedUrls = urlsToConnect.split(',');

	connect(shouldUseExternalWriter, splittedUrls);
});

export const externalWriter = {
	connect,
	write,
	helpers: {
		functionsName
	}
};
