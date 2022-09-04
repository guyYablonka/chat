import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import { settings } from '../../../settings';
import { call, RoomManager, RoomHistoryManager } from '../../../ui-utils';
import { roomTypes } from '../../../utils';
import { hasAllPermission } from '../../../authorization';
import './messageBoxNotSubscribed.html';

Template.messageBoxNotSubscribed.helpers({
	customTemplate() {
		return roomTypes.getNotSubscribedTpl(this.rid);
	},
	canJoinRoom() {
		return Meteor.userId() && roomTypes.verifyShowJoinLink(this.rid);
	},
	roomName() {
		const room = Session.get(`roomData${this.rid}`);
		return roomTypes.getRoomName(room.t, room);
	},
	isAnonymousReadAllowed() {
		return (
			Meteor.userId() == null &&
			settings.get('Accounts_AllowAnonymousRead') === true
		);
	},
	isAnonymousWriteAllowed() {
		return (
			Meteor.userId() == null &&
			settings.get('Accounts_AllowAnonymousRead') === true &&
			settings.get('Accounts_AllowAnonymousWrite') === true
		);
	}
});

Template.messageBoxNotSubscribed.events({
	'click .js-register'(event) {
		event.stopPropagation();
		event.preventDefault();

		Session.set('forceLogin', true);
	},
	async 'click .js-register-anonymous'(event) {
		event.stopPropagation();
		event.preventDefault();

		const { token } = await call('registerUser', {});
		Meteor.loginWithToken(token);
	}
});
