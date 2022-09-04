import { Template } from 'meteor/templating';

import { settings } from '../../../../../app/settings';
import { modal } from '../../../../../app/ui-utils/client';
import { t } from '../../../../../app/utils';
import { fireGlobalEvent } from '../../../../ui-utils';
import './header.html';
import { callbacks } from '../../../../callbacks/client';

const isAdminPanel = () => {
	return (
		Template.instance().data.sectionName &&
		Template.instance().data.sectionName !==
			settings.get('Layout_Home_Title')
	);
};

const whatsNewEnabled = () => {
	return settings.get('Whats_new_enabled');
};

Template.header.helpers({
	back() {
		return Template.instance().data.back;
	},
	buttons() {
		console.log('asdasd');
	},
	showWhatsNewButton() {
		return whatsNewEnabled() && !isAdminPanel();
	}
});

Template.header.events({
	'click #whats-new-button'() {
		const text = settings.get('Whats_New_Content');
		modal.open({
			title: t('Whats_New_Title'),
			text,
			showConfirmButton: true,
			showCancelButton: false,
			confirmButtonText: t('Close'),
			html: true
		});
		callbacks.run('userClickedOnWhatsNewButton');
	},
	'click .iframe-toolbar .js-iframe-action'(e) {
		fireGlobalEvent('click-toolbar-button', { id: this.id });
		e.currentTarget.querySelector('button').blur();
		return false;
	}
});
