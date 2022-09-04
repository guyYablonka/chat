import { API } from '../api';
import { settings } from '../../../settings';

API.helperMethods.set('getLimit', function _getLimit() {
	const FALLBACK_VALUE = 48;
	const date = new Date();
	const timeLimitFromSettings = settings.get(
		'Message_History_Time_Limit_In_Hours'
	);

	const timeLimit = !_.isNaN(parseInt(timeLimitFromSettings))
		? parseInt(timeLimitFromSettings)
		: FALLBACK_VALUE;

	date.setHours(date.getHours() - timeLimit);

	return date;
});
