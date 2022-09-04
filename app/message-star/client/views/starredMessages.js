import _ from 'underscore';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';

import { messageContext } from '../../../ui-utils/client/lib/messageContext';
import { Messages } from '../../../models/client';
import { upsertMessageBulk } from '../../../ui-utils/client/lib/RoomHistoryManager';
import { APIClient } from '../../../utils/client';
import { getCommonRoomEvents } from '../../../ui/client/views/app/lib/getCommonRoomEvents';

const LIMIT_DEFAULT = 50;

Template.starredMessages.helpers({
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

Template.starredMessages.onCreated(function () {
	this.rid = this.data.rid;
	this.messages = new Mongo.Collection(null);
	this.hasMore = new ReactiveVar(true);
	this.limit = new ReactiveVar(LIMIT_DEFAULT);

	const reloadList = list => {
		this.messages.remove({});
		list.forEach(msg => this.messages.upsert({ _id: msg._id }, msg));
	};

	this.autorun(() => {
		const query = {
			_hidden: { $ne: true },
			'starred._id': Meteor.userId(),
			rid: this.rid
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
				const updatedList = this.messages
					.find()
					.fetch()
					.filter(msg => msg._id !== _id);

				reloadList(updatedList);
			}
		});
	});

	this.autorun(async () => {
		const limit = this.limit.get();
		const { messages, total } = await APIClient.v1.get(
			`chat.getStarredMessages?roomId=${this.rid}&count=${limit}`
		);

		upsertMessageBulk({ msgs: messages }, this.messages);

		this.hasMore.set(total > limit);
	});
});

Template.mentionsFlexTab.onDestroyed(function () {
	this.cursor.stop();
});

Template.starredMessages.events({
	...getCommonRoomEvents(),
	'scroll .js-list': _.throttle(function (e, instance) {
		if (
			e.target.scrollTop >=
			e.target.scrollHeight - e.target.clientHeight
		) {
			return instance.limit.set(instance.limit.get() + 50);
		}
	}, 200)
});
