export const getDirectDisplayName = ({
	customFields = {},
	name,
	username
} = {}) => {
	const { firstName, lastName, fullName } = customFields;

	return (
		getFirstAndLastName(firstName, lastName) ||
		getFullName(fullName) ||
		getNameOrUsername(name, username) ||
		''
	);
};

const getFirstAndLastName = (firstName, lastName) =>
	firstName && lastName ? `${firstName} ${lastName}` : '';

const getFullName = fullName =>
	Array.isArray(fullName) ? fullName[0] : fullName;

const getNameOrUsername = (name, username) =>
	name?.split('/')?.pop() ?? username;
