import { Accounts } from 'meteor/accounts-base';

import { callbacks } from '../../../../../callbacks/server';
import { settings } from '../../../../../settings/server';

import getSSOServiceName from './getSSOServiceName';
import sendActivationEmailToAdmins from './sendActivationEmailToAdmins';
import setUserFieldsByServices from './setUserFieldsByServices';

Accounts.onCreateUser((options, user = {}) => {
	callbacks.run('beforeCreateUser', options, user);

	user.status = 'offline';
	user.active =
		user.active ?? !settings.get('Accounts_ManuallyApproveNewUsers');
	user.name = user.name || options.profile?.name;

	setUserFieldsByServices(user);

	const ssoServiceName = getSSOServiceName(user.services);
	const fullServiceName = ssoServiceName && `sso (${ssoServiceName})`;

	user.createdFrom = options.createdFrom || fullServiceName || 'api request';

	if (!user.active) {
		sendActivationEmailToAdmins(options);
	}

	return user;
});
