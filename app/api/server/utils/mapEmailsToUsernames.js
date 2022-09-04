import { Users } from '../../../models';

export const mapEmailsToUsernames = members => {
	const matchedUsers = Users.findByUsernamesOrEmails(members).fetch();

	const mappedUsernames = matchedUsers.map(currentUser => {
		return currentUser.username;
	});

	return mappedUsernames;
};
