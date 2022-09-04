import { Meteor } from 'meteor/meteor';
import httpContext from 'express-http-context';
import morgan from 'morgan';

import { LoggerManager, Logger } from '../../../logger';
import { settings } from '../../../settings';
import initiateRequestData from './initiateRequestData';

settings.get('Log_Package', function (key, value) {
	LoggerManager.showPackage = value;
});

settings.get('Log_File', function (key, value) {
	LoggerManager.showFileAndLine = value;
});

settings.get('Log_Level', function (key, value) {
	if (value != null) {
		LoggerManager.logLevel = parseInt(value);
		Meteor.setTimeout(() => LoggerManager.enable(true), 200);
	}
});

const logger = new Logger('ConfigLogger', {}, __filename);

WebApp.rawConnectHandlers.use(httpContext.middleware);
WebApp.rawConnectHandlers.use(function (req, res, next) {
	initiateRequestData(req);
	res.setHeader('X-Instance-ID', InstanceStatus.id());
	return next();
});
WebApp.rawConnectHandlers.use(
	morgan((tokens, req, res) => {
		const type = tokens.method(req, res);
		const route = httpContext.get('route') ?? tokens.url(req, res);
		const status = tokens.status(req, res);
		const responseTime = `${tokens['total-time'](req, res)}ms`;

		const routesToInclude =
			route.startsWith('/api') ||
			route.startsWith('/file-upload') ||
			route.startsWith('/ufs');

		if (process.env.NODE_ENV == 'production' && routesToInclude) {
			logger.info('Request conclusion', {
				type,
				route,
				status,
				responseTime
			});
		}
	})
);
