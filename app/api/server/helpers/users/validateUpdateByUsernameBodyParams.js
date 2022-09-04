import { API } from '../../api';
import { Meteor } from 'meteor/meteor';

API.helperMethods.set(
	'validateUpdateByUsernameBodyParams',
	function _validateUpdateByUsernameBodyParams() {
		check(
			this.bodyParams,
			Match.ObjectIncluding({
				username: String,
				data: Match.ObjectIncluding({
					email: Match.Maybe(String),
					name: Match.Maybe(String),
					password: Match.Maybe(String),
					active: Match.Maybe(Boolean),
					roles: Match.Maybe(Array),
					joinDefaultChannels: Match.Maybe(Boolean),
					requirePasswordChange: Match.Maybe(Boolean),
					sendWelcomeEmail: Match.Maybe(Boolean),
					verified: Match.Maybe(Boolean),
					customFields: Match.Maybe(Object)
				})
			})
		);
	}
);
