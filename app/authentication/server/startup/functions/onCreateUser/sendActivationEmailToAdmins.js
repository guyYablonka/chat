import { Accounts } from 'meteor/accounts-base';

import * as Mailer from '../../../../../mailer/server/api';
import { Roles } from '../../../../../models/server';
import { settings } from '../../../../../settings/server';

const sendActivationEmailToAdmins = options => {
	const destinations = [];

	Roles.findUsersInRole('admin').forEach(adminUser => {
		if (Array.isArray(adminUser.emails)) {
			adminUser.emails.forEach(email => {
				destinations.push(`${adminUser.name}<${email.address}>`);
			});
		}
	});

	const email = {
		to: destinations,
		from: settings.get('From_Email'),
		subject: Accounts.emailTemplates.userToActivate.subject(),
		html: Accounts.emailTemplates.userToActivate.html(options)
	};

	Mailer.send(email);
};

export default sendActivationEmailToAdmins;
