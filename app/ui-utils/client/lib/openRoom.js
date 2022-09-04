import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { Session } from 'meteor/session';
import mem from 'mem';
import _ from 'underscore';

import { Messages, ChatSubscription, Rooms } from '../../../models';
import { settings } from '../../../settings';
import { callbacks } from '../../../callbacks';
import { roomTypes, RoomTypes } from '../../../utils';
import { call, callMethod } from './callMethod';
import { RoomManager, fireGlobalEvent, RoomHistoryManager } from '..';
import { waitUntilWrapperExists } from './RoomHistoryManager';

window.currentTracker = undefined;

// cleanup session when hot reloading
Session.set('openedRoom', null);

const getDomOfLoading = mem(function getDomOfLoading() {
	const loadingDom = document.createElement('div');
	const contentAsFunc = content => () => content;

	const template = Blaze._TemplateWith({}, contentAsFunc(Template.loading));
	Blaze.render(template, loadingDom);

	return loadingDom;
});

function replaceCenterDomBy(dom) {
	document.dispatchEvent(new CustomEvent('main-content-destroyed'));

	return new Promise(resolve => {
		setTimeout(() => {
			const mainNode = document.querySelector('.main-content');
			if (mainNode) {
				for (const child of Array.from(mainNode.children)) {
					if (child) {
						mainNode.removeChild(child);
					}
				}
				const roomNode = dom();
				mainNode.appendChild(roomNode);
				return resolve([mainNode, roomNode]);
			}
			resolve(mainNode);
		}, 0);
	});
}

const waitUntilRoomBeInserted = async (type, rid) =>
	new Promise(resolve => {
		Tracker.autorun(c => {
			const room = roomTypes.findRoom(type, rid, Meteor.user());
			if (room) {
				c.stop();
				return resolve(room);
			}
		});
	});

const jumpToMessage = async (room, messageId) => {
	const msg = { _id: messageId, rid: room._id };
	const message =
		Messages.findOne({ _id: msg._id }) ||
		(await call('getMessages', [msg._id]))[0];
	if (message && (message.tmid || message.tcount)) {
		FlowRouter.setParams({
			tab: 'thread',
			context: message.tmid || message._id
		});
		return false;
	}
	RoomHistoryManager.getSurroundingMessages(msg);
	FlowRouter.setQueryParams({
		msg: undefined
	});

	return true;
};

const shouldTryToOpenRoom = (roomType, roomName) => {
	const currentRoomId = Session.get('openedRoom');
	const isNotInAnyRoom = !currentRoomId;
	const currentRoomData = Session.get(`roomData${currentRoomId}`);
	const isAlreadyAtRoom = currentRoomData?.name === roomName;
	const isDirectRoom = roomType === RoomTypes.DM;
	const isJumpingToMessage = !!FlowRouter.getQueryParam('msg');
	const isDirectJumpToMessage =
		currentRoomId && isDirectRoom && isJumpingToMessage;

	return isNotInAnyRoom || isAlreadyAtRoom || isDirectJumpToMessage;
};

export const openRoom = async function (type, name) {
	window.currentTracker && window.currentTracker.stop();
	window.currentTracker = Tracker.autorun(async function (c) {
		const user = Meteor.user();
		if (
			(user && user.username == null) ||
			(user == null &&
				settings.get('Accounts_AllowAnonymousRead') === false)
		) {
			BlazeLayout.render('main');
			return;
		}

		try {
			if (shouldTryToOpenRoom(type, name)) {
				const room =
					roomTypes.findRoom(type, name, user) ||
					(await callMethod('getRoomByTypeAndName', type, name));
				Rooms.upsert({ _id: room._id }, _.omit(room, '_id'));

				if (room._id !== name && type === RoomTypes.DM) {
					// Redirect old url using username to rid
					RoomManager.close(type + name);
					return FlowRouter.go(
						'direct',
						{ rid: room._id },
						FlowRouter.current().queryParams
					);
				}

				if (
					room._id === Session.get('openedRoom') &&
					!FlowRouter.getQueryParam('msg')
				) {
					return;
				}

				if (RoomManager.open(type + name).ready() !== true) {
					if (settings.get('Accounts_AllowAnonymousRead')) {
						BlazeLayout.render('main');
					}

					await replaceCenterDomBy(() => getDomOfLoading());
					return;
				}

				BlazeLayout.render('main', {
					center: 'loading'
				});

				c.stop();

				if (window.currentTracker) {
					window.currentTracker = undefined;
				}

				if (room._id !== Session.get('openedRoom')) {
					const [mainNode, roomDom] = await replaceCenterDomBy(() =>
						RoomManager.getDomOfRoom(
							type + name,
							room._id,
							roomTypes.getConfig(type).mainTemplate
						)
					);

					if (mainNode) {
						const selector = await waitUntilWrapperExists(
							'.messages-box .wrapper'
						);
						selector.scrollTop = roomDom.oldScrollTop;
					}
				}

				Session.set('openedRoom', room._id);
				RoomManager.openedRoom = room._id;

				fireGlobalEvent('room-opened', _.omit(room, 'usernames'));

				Session.set('editRoomTitle', false);

				const sub = ChatSubscription.findOne({ rid: room._id });

				const messageToJump = FlowRouter.getQueryParam('msg');

				if (messageToJump) {
					const shouldRunCallback = await jumpToMessage(
						room,
						messageToJump
					);

					if (!shouldRunCallback) return;
				}

				return callbacks.run('enter-room', sub);
			}
		} catch (error) {
			c.stop();
			if (type === RoomTypes.DM) {
				const result = await call(
					'createDirectMessage',
					...name.split(', ')
				)
					.then(result => waitUntilRoomBeInserted(type, result.rid))
					.catch(() => {});
				if (result) {
					return FlowRouter.go(
						'direct',
						{ rid: result._id },
						FlowRouter.current().queryParams
					);
				}
			}
			Session.set('roomNotFound', { type, name, error });
			return BlazeLayout.render('main', { center: 'roomNotFound' });
		}
	});
};
