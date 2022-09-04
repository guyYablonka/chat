import { API } from '../api';
import { Meteor } from 'meteor/meteor';

API.helperMethods.set(
	'validateOneFromSomeBodyParamsInclude',
	function _validateOneFromSomeBodyParamsInclude(params) {
		check(params, Array);
		if (!params.some(param => this.bodyParams[param]))
			throw new Meteor.Error(
				'error-missing-parameter',
				`Body must include one of the folowing params: ${[...params]}`
			);
	}
);
