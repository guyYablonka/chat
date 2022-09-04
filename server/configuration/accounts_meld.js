import _ from 'underscore';
import { Accounts } from 'meteor/accounts-base';

import { Users } from '../../app/models';

const orig_updateOrCreateUserFromExternalService =
	Accounts.updateOrCreateUserFromExternalService;

Accounts.updateOrCreateUserFromExternalService = function (
	serviceName,
	serviceData = {},
	...args /* , options*/
) {
	if (serviceData.username) {
		serviceData.email = `${serviceData.username}@idfts.il`;
	}

	if (serviceData.email) {
		const user = Users.findOneByEmailAddress(serviceData.email);
		if (user != null) {
			const findQuery = {
				address: serviceData.email,
				verified: true
			};

			if (
				user.services?.password &&
				!_.findWhere(user.emails, findQuery)
			) {
				Users.resetPasswordAndSetRequirePasswordChange(
					user._id,
					true,
					'This_email_has_already_been_used_and_has_not_been_verified__Please_change_your_password'
				);
			}

			Users.setServiceId(user._id, serviceName, serviceData.id);
			Users.setEmailVerified(user._id, serviceData.email);
		}
	}

	return orig_updateOrCreateUserFromExternalService.apply(this, [
		serviceName,
		serviceData,
		...args
	]);
};
