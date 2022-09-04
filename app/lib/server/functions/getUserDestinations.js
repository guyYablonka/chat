import _ from 'underscore';
import { getDestinations } from './getDestinations';

export const getUserDestinations = function (username) {
	const userDestinations = getDestinations([username]) || {};

	return !_.isEmpty(userDestinations) && userDestinations;
};
