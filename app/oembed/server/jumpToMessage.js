import URL from 'url';
import QueryString from 'querystring';

import { Meteor } from 'meteor/meteor';
import _ from 'underscore';

import { Messages } from '../../models';
import { settings } from '../../settings';
import { callbacks } from '../../callbacks';
import { getUserAvatarURL } from '../../utils/lib/getUserAvatarURL';

const recursiveRemove = (message, deep = 1) => {
	if (message) {
		if (
			'attachments' in message &&
			message.attachments !== null &&
			deep < settings.get('Message_QuoteChainLimit')
		) {
			message.attachments.map(msg => recursiveRemove(msg, deep + 1));
		} else {
			delete message.attachments;
		}
	}
	return message;
};

const getAttachmentObject = (jumpToMessage, { url }) => ({
	text: jumpToMessage.msg,
	translations: jumpToMessage.translations,
	author_name:
		jumpToMessage.alias || jumpToMessage.u.name || jumpToMessage.u.username,
	author_icon: getUserAvatarURL(jumpToMessage.u.username),
	message_link: url,
	attachments: jumpToMessage.attachments || [],
	ts: jumpToMessage.ts,
	type: 'quote',
	msgId: jumpToMessage._id,
	rid: jumpToMessage.rid
});

callbacks.add(
	'beforeSaveMessage',
	msg => {
		msg?.urls?.forEach(item => {
			if (item.url.indexOf(Meteor.absoluteUrl()) === 0) {
				const urlObj = URL.parse(item.url);

				if (urlObj.query) {
					const queryString = QueryString.parse(urlObj.query);

					if (_.isString(queryString.msg)) {
						const jumpToMessage = recursiveRemove(
							Messages.findOneById(queryString.msg)
						);

						if (jumpToMessage) {
							msg.attachments = msg.attachments || [];

							const index = msg.attachments.findIndex(
								a => a.message_link === item.url
							);
							if (index > -1) {
								msg.attachments.splice(index, 1);
							}

							msg.attachments.push(
								getAttachmentObject(jumpToMessage, item)
							);
							item.ignoreParse = true;
						}
					}
				}
			}
		});

		return msg;
	},
	callbacks.priority.LOW,
	'jumpToMessage'
);
