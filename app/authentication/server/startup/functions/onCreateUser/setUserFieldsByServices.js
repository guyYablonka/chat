import { settings } from '../../../../../settings/server';

const setUserFieldsByServices = user => {
	if (!user.services) return undefined;

	const verified = settings.get(
		'Accounts_Verify_Email_For_External_Accounts'
	);

	Object.values(user.services).forEach(service => {
		if (!user.name) {
			user.name = service.name || service.username;
		}

		if (!user.emails && service.email) {
			user.emails = [
				{
					address: service.email,
					verified
				}
			];
		}
	});
};

export default setUserFieldsByServices;
