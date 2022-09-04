import { useCallback } from 'react';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import moment from 'moment';

export const useTimeAgo = () =>
	useCallback(
		time =>
			moment(time).calendar(null, {
				sameDay: 'LT',
				lastWeek: 'dddd LT',
				sameElse: 'LL'
			}),
		[]
	);

export const useShortTimeAgo = () =>
	useCallback(
		time =>
			moment(time).calendar(null, {
				sameDay: 'LT',
				lastDay: `[${TAPi18n.__('Yesterday')}]`,
				lastWeek: 'DD/MM/YYYY',
				sameElse: 'DD/MM/YYYY'
			}),
		[]
	);
