import { Meteor } from 'meteor/meteor';

import { Users, Settings } from '../../../models';
import { Logger } from '/app/logger/server';

const logger = new Logger('updateLastWhatsNewVersion', {}, __filename);

Meteor.methods({
	updateLastWhatsNewVersion() {
		const lastWhatsNewVersion =
			Settings.findOneById('Whats_New_Content')._updatedAt;
		const userId = Meteor.userId();
		if (userId) {
			const userLastWhatsNewVersion = Users.getLastWhatsNewVersionById(
				Meteor.userId()
			);
			if (
				!userLastWhatsNewVersion ||
				lastWhatsNewVersion > userLastWhatsNewVersion
			) {
				Users.updateLastWhatsNewVersionById(
					Meteor.userId(),
					lastWhatsNewVersion
				);
				return true;
			}
		} else {
			logger.info(`Meteor.userId() return ${userId}`);
		}
		return false;
	}
});
