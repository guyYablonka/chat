import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { Blaze } from 'meteor/blaze';

import { promises } from '../../../promises/client';
import { RoomManager } from './RoomManager';
import { readMessage } from './readMessages';
import { renderMessageBody } from '../../../../client/lib/renderMessageBody';
import { settings } from '../../../settings';
import { ChatMessage, ChatSubscription, ChatRoom } from '../../../models';
import { call } from './callMethod';
import { filterMarkdown } from '../../../markdown/lib/markdown';
import { escapeHTML } from '../../../../lib/escapeHTML';
import { isBrowserChrome, isVersionBiggerThan } from './browserSupport';

export const normalizeThreadMessage = ({ ...message }) => {
	if (message.msg) {
		message.msg = filterMarkdown(message.msg);
		delete message.mentions;
		return renderMessageBody(message).replace(/<br\s?\\?>/g, ' ');
	}

	if (message.attachments) {
		const attachment = message.attachments.find(
			attachment => attachment.title || attachment.description
		);

		if (attachment && attachment.description) {
			return escapeHTML(attachment.description);
		}

		if (attachment && attachment.title) {
			return escapeHTML(attachment.title);
		}
	}
};

export const waitUntilWrapperExists = async (
	selector = '.messages-box .wrapper'
) =>
	document.querySelector(selector) ||
	new Promise(resolve => {
		const observer = new MutationObserver(function (mutations, obs) {
			const element = document.querySelector(selector);
			if (element) {
				obs.disconnect(); // stop observing
				return resolve(element);
			}
		});
		observer.observe(document, {
			childList: true,
			subtree: true
		});
	});

export const upsertMessage = async (
	{ msg, subscription, uid = Tracker.nonreactive(() => Meteor.userId()) },
	collection = ChatMessage
) => {
	const userId = msg.u && msg.u._id;

	if (
		subscription &&
		subscription.ignored &&
		subscription.ignored.indexOf(userId) > -1
	) {
		msg.ignored = true;
	}

	// const roles = [
	// 	(userId && UserRoles.findOne(userId, { fields: { roles: 1 } })) || {},
	// 	(userId && RoomRoles.findOne({ rid: msg.rid, 'u._id': userId })) || {},
	// ].map((e) => e.roles);
	// msg.roles = _.union.apply(_.union, roles);

	if (msg.t === 'e2e' && !msg.file) {
		msg.e2e = 'pending';
	}
	msg = (await promises.run('onClientMessageReceived', msg)) || msg;

	const { _id, ...messageToUpsert } = msg;

	if (msg.tcount) {
		collection.direct.update(
			{ tmid: _id },
			{
				$set: {
					following: msg.replies && msg.replies.indexOf(uid) > -1,
					threadMsg: normalizeThreadMessage(messageToUpsert),
					repliesCount: msg.tcount
				}
			},
			{ multi: true }
		);
	}

	return collection.direct.upsert({ _id }, messageToUpsert);
};

export const jumpToMessageInDOM = (messageElement, wrapper) => {
	const pos =
		wrapper.scrollTop() +
		messageElement.offset().top -
		wrapper.height() / 2;
	wrapper.animate(
		{
			scrollTop: pos
		},
		500
	);
};

export function upsertMessageBulk(
	{ msgs, subscription },
	collection = ChatMessage
) {
	const uid = Tracker.nonreactive(() => Meteor.userId());
	const { queries } = ChatMessage;
	collection.queries = [];
	msgs.forEach((msg, index) => {
		if (index === msgs.length - 1) {
			ChatMessage.queries = queries;
		}
		upsertMessage({ msg, subscription, uid }, collection);
	});
}

let defaultLimit;
const getDefaultLimit = () => {
	return (defaultLimit =
		defaultLimit ??
		(settings.get('Message_NumberOfMessagesToLoadFromHistory') || 50));
};

export const waitAfterFlush = fn =>
	setTimeout(() => Tracker.afterFlush(fn), 10);

export const RoomHistoryManager = new (class {
	constructor() {
		this.histories = {};
	}

	getRoom(rid) {
		if (!this.histories[rid]) {
			this.histories[rid] = {
				hasMore: new ReactiveVar(true),
				hasMoreNext: new ReactiveVar(false),
				isLoading: new ReactiveVar(false),
				unreadNotLoaded: new ReactiveVar(0),
				firstUnread: new ReactiveVar(),
				loaded: undefined
			};
		}

		return this.histories[rid];
	}

	async getMore(rid, limit = getDefaultLimit()) {
		let ts;
		const room = this.getRoom(rid);

		if (room.hasMore.curValue !== true) {
			return;
		}

		room.isLoading.set(true);

		// ScrollListener.setLoader true
		const lastMessage = ChatMessage.findOne(
			{ rid, _hidden: { $ne: true } },
			{ sort: { ts: 1 } }
		);
		// lastMessage ?= ChatMessage.findOne({rid: rid}, {sort: {ts: 1}})

		if (lastMessage) {
			({ ts } = lastMessage);
		} else {
			ts = undefined;
		}

		let ls = undefined;
		let typeName = undefined;

		const subscription = ChatSubscription.findOne({ rid });
		if (subscription) {
			({ ls } = subscription);
			typeName = subscription.t + subscription.name;
		} else {
			const curRoomDoc = ChatRoom.findOne({ _id: rid });
			typeName =
				(curRoomDoc ? curRoomDoc.t : undefined) +
				(curRoomDoc ? curRoomDoc.name : undefined);
		}

		const result = await call('loadHistory', rid, ts, limit, ls);

		let previousHeight;
		let scroll;
		const { messages = [] } = result;
		room.unreadNotLoaded.set(result.unreadNotLoaded);
		room.firstUnread.set(result.firstUnread);

		const wrapper = $('.messages-box .wrapper').get(0);
		if (wrapper) {
			previousHeight = wrapper.scrollHeight;
			scroll = wrapper.scrollTop;
		}

		upsertMessageBulk({
			msgs: messages.filter(msg => msg.t !== 'command'),
			subscription
		});

		if (!room.loaded) {
			room.loaded = 0;
		}

		room.loaded += messages.length;

		if (messages.length < limit) {
			room.hasMore.set(false);
		}

		if (wrapper) {
			waitAfterFlush(() => {
				if (
					(!isBrowserChrome || isVersionBiggerThan(79)) &&
					wrapper.children[0].scrollHeight <= wrapper.offsetHeight
				) {
					return this.getMore(rid);
				}
				const heightDiff = wrapper.scrollHeight - previousHeight;
				wrapper.scrollTop = scroll + heightDiff;
			});
		}

		room.isLoading.set(false);
		waitAfterFlush(() => {
			readMessage.refreshUnreadMark(rid);
			return RoomManager.updateMentionsMarksOfRoom(typeName);
		});
	}

	getMoreNext(rid, limit = getDefaultLimit()) {
		const room = this.getRoom(rid);
		if (room.hasMoreNext.curValue !== true) {
			return;
		}

		const instance = Blaze.getView(
			$('.messages-box .wrapper')[0]
		).templateInstance();
		instance.atBottom.set(false);

		room.isLoading.set(true);

		const lastMessage = ChatMessage.findOne(
			{ rid, _hidden: { $ne: true } },
			{ sort: { ts: -1 } }
		);

		let typeName = undefined;

		const subscription = ChatSubscription.findOne({ rid });
		if (subscription) {
			// const { ls } = subscription;
			typeName = subscription.t + subscription.name;
		} else {
			const curRoomDoc = ChatRoom.findOne({ _id: rid });
			typeName =
				(curRoomDoc ? curRoomDoc.t : undefined) +
				(curRoomDoc ? curRoomDoc.name : undefined);
		}

		const { ts } = lastMessage;

		if (ts) {
			return Meteor.call(
				'loadNextMessages',
				rid,
				ts,
				limit,
				function (err, result) {
					upsertMessageBulk({
						msgs: Array.from(result.messages).filter(
							msg => msg.t !== 'command'
						),
						subscription
					});

					Meteor.defer(() =>
						RoomManager.updateMentionsMarksOfRoom(typeName)
					);

					room.isLoading.set(false);
					if (!room.loaded) {
						room.loaded = 0;
					}

					room.loaded += result.messages.length;
					if (result.messages.length < limit) {
						room.hasMoreNext.set(false);
					}
				}
			);
		}
	}

	async getSurroundingMessages(
		message,
		limit = getDefaultLimit(),
		jump = true
	) {
		if (!message || !message.rid) {
			return;
		}

		const w = await waitUntilWrapperExists();

		const instance = Blaze.getView(w).templateInstance();

		if (
			jump &&
			ChatMessage.findOne({
				_id: message._id,
				_hidden: null
			})
		) {
			const msgElement = $(`#${message._id}`, w);
			if (msgElement.length === 0) {
				return;
			}

			const wrapper = $('.messages-box .wrapper');
			jumpToMessageInDOM(msgElement, wrapper);

			msgElement.addClass('highlight');

			return setTimeout(() => msgElement.removeClass('highlight'), 6000);
		}

		const room = this.getRoom(message.rid);
		room.isLoading.set(true);
		let typeName = undefined;

		const subscription = ChatSubscription.findOne({ rid: message.rid });
		if (subscription) {
			// const { ls } = subscription;
			typeName = subscription.t + subscription.name;
		} else {
			const curRoomDoc = ChatRoom.findOne({ _id: message.rid });
			typeName =
				(curRoomDoc ? curRoomDoc.t : undefined) +
				(curRoomDoc ? curRoomDoc.name : undefined);
		}

		return Meteor.call(
			'loadSurroundingMessages',
			message,
			limit,
			function (err, result) {
				if (!result || !result.messages) {
					return;
				}
				ChatMessage.remove({ rid: message.rid });
				for (const msg of Array.from(result.messages)) {
					if (msg.t !== 'command') {
						upsertMessage({ msg, subscription });
					}
				}

				readMessage.refreshUnreadMark(message.rid);
				RoomManager.updateMentionsMarksOfRoom(typeName);

				if (jump) {
					waitAfterFlush(() => {
						const wrapper = $('.messages-box .wrapper');
						const msgElement = $(`#${message._id}`, wrapper);
						jumpToMessageInDOM(msgElement, wrapper);
						msgElement.addClass('highlight');
						room.isLoading.set(false);
						const messages = wrapper[0];
						instance.atBottom.set(
							!result.moreAfter &&
								messages.scrollTop >=
									messages.scrollHeight -
										messages.clientHeight
						);
						setTimeout(
							() => msgElement.removeClass('highlight'),
							6000
						);
					});
				}

				if (!room.loaded) {
					room.loaded = 0;
				}
				room.loaded += result.messages.length;
				room.hasMore.set(result.moreBefore);
				return room.hasMoreNext.set(result.moreAfter);
			}
		);
	}

	hasMore(rid) {
		const room = this.getRoom(rid);
		return room.hasMore.get();
	}

	hasMoreNext(rid) {
		const room = this.getRoom(rid);
		return room.hasMoreNext.get();
	}

	getMoreIfIsEmpty(rid) {
		const room = this.getRoom(rid);

		if (room.loaded === undefined) {
			return this.getMore(rid);
		}
	}

	isLoading(rid) {
		const room = this.getRoom(rid);
		return room.isLoading.get();
	}

	clear(rid) {
		ChatMessage.remove({ rid });
		if (this.histories[rid]) {
			this.histories[rid].hasMore.set(true);
			this.histories[rid].isLoading.set(false);
			this.histories[rid].loaded = undefined;
		}
	}
})();
