import _ from 'underscore';
import { Mongo } from 'meteor/mongo';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import { upsertMessageBulk } from '../../../ui-utils/client/lib/RoomHistoryManager';
import { messageContext } from '../../../ui-utils/client/lib/messageContext';
import { APIClient } from '../../../utils/client';
import { Messages } from '../../../models/client';
import { getCommonRoomEvents } from '../../../ui/client/views/app/lib/getCommonRoomEvents';

const LIMIT_DEFAULT = 50;

Template.pinnedMessages.helpers({
	hasMessages() {
		return Template.instance().messages.find().count();
	},
	messages() {
		const instance = Template.instance();
		return instance.messages.find(
			{},
			{ limit: instance.limit.get(), sort: { ts: -1 } }
		);
	},
	hasMore() {
		return Template.instance().hasMore.get();
	},
	messageContext
});

Template.pinnedMessages.onCreated(function () {
	this.pinnedMessages = new ReactiveVar([]);
	this.hasMore = new ReactiveVar(true);
	this.limit = new ReactiveVar(LIMIT_DEFAULT);
	this.rid = this.data.rid;
	this.messages = new Mongo.Collection(null);

	this.autorun(() => {
		const query = {
			t: { $ne: 'rm' },
			_hidden: { $ne: true },
			pinned: true,
			rid: this.data.rid
		};

		this.cursor && this.cursor.stop();

		this.limit.set(LIMIT_DEFAULT);

		this.cursor = Messages.find(query).observe({
			added: ({ _id, ts, _updatedAt, ...message }) => {
				this.messages.upsert(
					{ _id },
					{
						ts: ts.toISOString(),
						_updatedAt: _updatedAt.toISOString(),
						...message
					}
				);
			},
			changed: ({ _id, ts, _updatedAt, ...message }) => {
				this.messages.upsert(
					{ _id },
					{
						ts: ts.toISOString(),
						_updatedAt: _updatedAt.toISOString(),
						...message
					}
				);
			},
			removed: ({ _id }) => {
				this.messages.remove({ _id });
			}
		});
	});

	this.autorun(async () => {
		const limit = this.limit.get();
		const { messages, total } = await APIClient.v1.get(
			`chat.getPinnedMessages?roomId=${this.rid}&count=${limit}`
		);

		upsertMessageBulk({ msgs: messages }, this.messages);

		this.hasMore.set(total > limit);
	});
});

Template.mentionsFlexTab.onDestroyed(function () {
	this.cursor.stop();
});

Template.pinnedMessages.events({
	...getCommonRoomEvents(),
	'scroll .js-list': _.throttle(function (e, instance) {
		if (
			e.target.scrollTop >=
				e.target.scrollHeight - e.target.clientHeight &&
			instance.hasMore.get()
		) {
			return instance.limit.set(instance.limit.get() + 50);
		}
	}, 200)
});