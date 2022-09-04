import { API } from '../api';
import { getStatistics, getLastStatistics } from '../../../statistics/server';
import { Logger } from '../../../logger';
import { settings } from '../../../settings';

const logger = new Logger('Mobile', __filename);

API.v1.addRoute(
	'statistics',
	{ authRequired: true },
	{
		get() {
			const { refresh } = this.requestParams();
			return API.v1.success(
				Promise.await(
					getLastStatistics({
						userId: this.userId,
						refresh: refresh && refresh === 'true'
					})
				)
			);
		}
	}
);

API.v1.addRoute(
	'statistics.list',
	{ authRequired: true },
	{
		get() {
			const { offset, count } = this.getPaginationItems();
			const { sort, fields, query } = this.parseJsonQuery();

			return API.v1.success(
				Promise.await(
					getStatistics({
						userId: this.userId,
						query,
						pagination: {
							offset,
							count,
							sort,
							fields
						}
					})
				)
			);
		}
	}
);

API.v1.addRoute(
	'statistics.reportLog',
	{ authRequired: false },
	{
		post() {
			const isLogsEnabled = settings.get('Android_Logs_Enabled');
			if (!isLogsEnabled) {
				return API.v1.notImplemented('Logs are disabled');
			}

			check(this.bodyParams, {
				username: String,
				logToReport: String,
				deviceInformation: String
			});

			const { logToReport, deviceInformation, username } =
				this.bodyParams;

			logger.error(logToReport, { deviceInformation, username });

			return API.v1.success(logToReport);
		}
	}
);
