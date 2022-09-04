// Convenience method, almost need to turn it into a middleware of sorts
import { Meteor } from 'meteor/meteor';

import { Users } from '../../../models';
import { API } from '../api';

API.helperMethods.set('getUserFromParams', function _getUserFromParams() {
	const doesntExist = { _doesntExist: true };
	let user;
	const params = this.requestParams();

	if (params.userId && params.userId.trim()) {
		user = Users.findOneById(params.userId) || doesntExist;
	} else if (params.username && params.username.trim()) {
		user = Users.findOneByUsernameOrEmail(params.username) || doesntExist;
	} else if (params.user && params.user.trim()) {
		user = Users.findOneByUsernameOrEmail(params.user) || doesntExist;
	} else {
		throw new Meteor.Error(
			'error-user-param-not-provided',
			'The required "userId" or "username" param was not provided'
		);
	}

	if (user._doesntExist) {
		throw new Meteor.Error(
			'error-invalid-user',
			`User ${
				params.username ?? params.user ?? params.userId
			} does not exist.`
		);
	}

	return user;
});
