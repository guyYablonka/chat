import { getDirectDisplayName } from './getDirectDisplayName';
import { Subscriptions } from '/app/models/server';

export const saveDirectDisplayName = (username, name, customFields) => {
	const directDisplayName = getDirectDisplayName({
		customFields,
		name,
		username
	});

	// Update customFields of all Direct Messages' Rooms for username
	Subscriptions.setUserDirectDisplayNameByUsername(
		username,
		directDisplayName
	);
};
