import { Meteor } from 'meteor/meteor';
import { HTML } from 'meteor/htmljs';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';

import { SideNav, menu } from '../../ui-utils';
import { settings } from '../../settings';
import { roomTypes, getUserPreference } from '../../utils';
import { Users } from '../../models';
import { createTemplateForComponent } from '../../../client/reactAdapters';
import { callbacks } from '../../callbacks/client';
import SidebarFooter from './SidebarFooter';

createTemplateForComponent('sidebarHeader', () =>
	import('../../../client/sidebar/header')
);
createTemplateForComponent(
	'sidebarChats',
	() => import('../../../client/sidebar/RoomList/RoomList'),
	{
		renderContainerView: () =>
			HTML.DIV({ style: 'display: flex; flex: 1 1 auto;' })
	}
); // eslint-disable-line new-cap

Template.sideNav.helpers({
	flexTemplate() {
		return SideNav.getFlex().template;
	},

	flexData() {
		return SideNav.getFlex().data;
	},

	SidebarFooter() {
		return SidebarFooter;
	},

	roomType() {
		return roomTypes.getTypes().map(roomType => ({
			template: roomType.customTemplate || 'roomList',
			data: {
				header: roomType.header,
				identifier: roomType.identifier,
				isCombined: roomType.isCombined,
				label: roomType.label
			}
		}));
	},

	loggedInUser() {
		return !!Meteor.userId();
	},

	sidebarViewMode() {
		const viewMode = getUserPreference(Meteor.userId(), 'sidebarViewMode');
		return viewMode || 'condensed';
	},

	sidebarHideAvatar() {
		return getUserPreference(Meteor.userId(), 'sidebarHideAvatar');
	}
});

Template.sideNav.events({
	'click .close-flex'() {
		return SideNav.closeFlex();
	},

	'click .arrow'() {
		return SideNav.toggleCurrent();
	},

	'click #questions-answers-button'() {
		callbacks.run('userClickedOnQuestionsAndAnswersButton');
	},

	'scroll .rooms-list'() {
		return menu.updateUnreadBars();
	},

	'dropped .sidebar'(e) {
		return e.preventDefault();
	},
	'mouseenter .sidebar-item__link'(e) {
		const element = e.currentTarget;
		setTimeout(() => {
			const ellipsedElement = element.querySelector(
				'.sidebar-item__ellipsis'
			);
			const isTextEllipsed =
				ellipsedElement.offsetWidth < ellipsedElement.scrollWidth;

			if (isTextEllipsed) {
				element.setAttribute(
					'title',
					element.getAttribute('aria-label')
				);
			} else {
				element.removeAttribute('title');
			}
		}, 0);
	}
});

const redirectToDefaultChannelIfNeeded = () => {
	const needToBeRedirect = () =>
		['/', '/home'].includes(FlowRouter.current().path);

	Tracker.autorun(c => {
		const firstChannelAfterLogin = settings.get(
			'First_Channel_After_Login'
		);

		if (!needToBeRedirect()) {
			return c.stop();
		}

		if (!firstChannelAfterLogin) {
			return c.stop();
		}

		const room = roomTypes.findRoom(
			'c',
			firstChannelAfterLogin,
			Meteor.userId()
		);

		if (!room) {
			return;
		}

		c.stop();
		FlowRouter.go(`/channel/${firstChannelAfterLogin}`);
	});
};

Template.sideNav.onRendered(function () {
	SideNav.init();
	menu.init();
	redirectToDefaultChannelIfNeeded();

	return Meteor.defer(() => menu.updateUnreadBars());
});

Template.sideNav.onCreated(function () {
	this.groupedByType = new ReactiveVar(false);

	this.autorun(() => {
		const user = Users.findOne(Meteor.userId(), {
			fields: {
				'settings.preferences.sidebarGroupByType': 1
			}
		});
		const userPref = getUserPreference(user, 'sidebarGroupByType');
		this.groupedByType.set(
			userPref || settings.get('UI_Group_Channels_By_Type')
		);
	});
});
