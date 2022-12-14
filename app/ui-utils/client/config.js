import { Meteor } from 'meteor/meteor';

const url = new URL(window.location);
const keys = new Set();

export const getConfig = key => {
	keys.add(key);
	return (
		url.searchParams.get(key) ||
		Meteor._localStorage.getItem(`rc-config-${key}`)
	);
};
