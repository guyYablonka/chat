import { Meteor } from 'meteor/meteor';
import { resetUserE2EEncriptionKey } from '../../../../server/lib/resetUserE2EKey';

Meteor.methods({
	'e2e.resetOwnE2EKey'() {
		const userId = Meteor.userId();

		if (!userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'resetOwnE2EKey'
			});
		}

		if (!resetUserE2EEncriptionKey(userId, false)) {
			return false;
		}
		return true;
	}
});
