import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { canDeleteMessage } from '../../../authorization/server/functions/canDeleteMessage';
import { Messages } from '../../../models';
import { deleteMessage } from '../functions';
import { extractMessageRemoval } from '../functions/extractions/extractMessageRemoval';
import { Rooms } from '/app/models/server';

Meteor.methods({
	deleteMessage(message, extraData = {}) {
		check(
			message,
			Match.ObjectIncluding({
				_id: String
			})
		);

		const uid = Meteor.userId();

		if (!uid) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'deleteMessage'
			});
		}

		const originalMessage = Messages.findOneById(message._id, {
			fields: {
				u: 1,
				rid: 1,
				file: 1,
				ts: 1,
				msg: 1
			}
		});

		if (!originalMessage || !canDeleteMessage(uid, originalMessage)) {
			throw new Meteor.Error('error-action-not-allowed', 'Not allowed', {
				method: 'deleteMessage',
				action: 'Delete_message'
			});
		}

		if (message.starred?.length) {
			Messages.removeAllStarsById(message._id);
		}

		const deletionResult = deleteMessage(originalMessage, Meteor.user());

		const room = Rooms.findOneById(originalMessage.rid);

		extractMessageRemoval(room, originalMessage, extraData);

		return deletionResult;
	}
});
