import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import moment from 'moment';

import { hasPermission } from '../../../authorization';
import { metrics } from '../../../metrics';
import { settings } from '../../../settings';
import { messageProperties } from '../../../ui-utils';
import { Users, Messages } from '../../../models';
import { sendMessage } from '../functions';
import { RateLimiter } from '../lib';
import { canSendMessage } from '../../../authorization/server';
import { api } from '../../../../server/sdk/api';
import { Logger } from '/app/logger/server';
import { getUserActionOrigin } from '../functions';
export const logger = new Logger('sendMessage', {}, __filename);

export const executeSendMessage = (uid, message, context, extraData = {}) => {
	if (context) {
		message.from = getUserActionOrigin(context);
	}

	logger.info('Send message was called with params', {
		msg: message,
		userId: uid,
		extraData: extraData,
		sessionId: this.connection?.id || this.connection?.sessionId
	});
	if (message.tshow && !message.tmid) {
		throw new Meteor.Error(
			'invalid-params',
			'tshow provided but missing tmid',
			{
				method: 'sendMessage'
			}
		);
	}

	if (message.tmid && !settings.get('Threads_enabled')) {
		throw new Meteor.Error('error-not-allowed', 'not-allowed', {
			method: 'sendMessage'
		});
	}

	if (message.ts) {
		if (!extraData?.fromProxy) {
			const tsDiff = Math.abs(moment(message.ts).diff());
			if (tsDiff > 60000) {
				throw new Meteor.Error(
					'error-message-ts-out-of-sync',
					'Message timestamp is out of sync',
					{
						method: 'sendMessage',
						message_ts: message.ts,
						server_ts: new Date().getTime()
					}
				);
			} else if (tsDiff > 10000) {
				message.ts = new Date();
			}
		}
	} else {
		message.ts = new Date();
	}

	if (message.msg) {
		const tempMessage = messageProperties.messageWithoutEmojiShortnames(
			message.msg
		);
		const adjustedMessage =
			messageProperties.messageWithoutQuoteUrl(tempMessage);

		if (
			messageProperties.length(adjustedMessage) >
			settings.get('Message_MaxAllowedSize')
		) {
			throw new Meteor.Error(
				'error-message-size-exceeded',
				'Message size exceeds Message_MaxAllowedSize',
				{
					method: 'sendMessage'
				}
			);
		}
	}

	const user = Users.findOneById(uid, {
		fields: {
			username: 1,
			name: 1,
			type: 1
		}
	});
	let { rid } = message;

	// do not allow nested threads
	if (message.tmid) {
		const parentMessage = Messages.findOneById(message.tmid);
		message.tmid = parentMessage.tmid || message.tmid;
		rid = parentMessage.rid;
	}

	if (!rid) {
		throw new Error("The 'rid' property on the message object is missing.");
	}

	try {
		const room = canSendMessage(rid, {
			uid,
			username: user.username,
			type: user.type
		});

		metrics.messagesSent.inc(); // TODO This line needs to be moved to it's proper place. See the comments on: https://github.com/RocketChat/Rocket.Chat/pull/5736

		logger.info('Message sent successfully', {
			...message,
			username: user.username,
			extraData: extraData ?? {},
			sessionId: this.connection?.sessionId || this.connection?.id
		});

		return sendMessage(user, message, room, false, extraData);
	} catch (error) {
		logger.error('Error sending message:', {
			error,
			sessionId: this.connection?.id || this.connection?.sessionId,
			username: user.username
		});

		const errorMessage =
			typeof error === 'string' ? error : error.error || error.message;
		api.broadcast('notify.ephemeralMessage', uid, message.rid, {
			msg: TAPi18n.__(errorMessage, {}, user.language)
		});

		if (typeof error === 'string') {
			throw new Error(error);
		}

		throw error;
	}
};

Meteor.methods({
	sendMessage(message, extraData = {}) {
		check(message, Object);

		const uid = Meteor.userId();

		if (!uid) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'sendMessage'
			});
		}

		try {
			return executeSendMessage(uid, message, this, extraData);
		} catch (error) {
			if ((error.error || error.message) === 'error-not-allowed') {
				throw new Meteor.Error(
					error.error || error.message,
					error.reason,
					{
						method: 'sendMessage'
					}
				);
			}
		}
	}
});
