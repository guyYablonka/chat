import { normalizeMessagesForUser } from '../../../utils/server/lib/normalizeMessagesForUser';
import { settings } from '../../../settings';
import { API } from '../api';
import { removeReactionNames } from '../../../lib/server/functions';

API.helperMethods.set(
	'composeRoomWithLastMessage',
	function _composeRoomWithLastMessage(room, userId, limited = false) {
		if (room.lastMessage) {
			const isTimeLimitEnabled = settings.get(
				'Message_History_Time_Limit_Enabled'
			);

			const canLastMessageBeSent =
				isTimeLimitEnabled && limited === true
					? room.lm >= this.getLimit()
					: true;

			if (canLastMessageBeSent) {
				const [lastMessage] = normalizeMessagesForUser(
					[room.lastMessage],
					userId
				);
				room.lastMessage = lastMessage;
			} else {
				delete room.lastMessage;
			}

			if (limited === true && room.lastMessage) {
				room.lastMessage = removeReactionNames([room.lastMessage])[0];
			}
		}
		return room;
	}
);
