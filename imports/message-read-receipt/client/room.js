import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import { callbacks } from '../../../app/callbacks';
import { t } from '../../../app/utils';
import { modal, MessageAction } from '../../../app/ui-utils';
import { messageArgs } from '../../../app/ui-utils/client/lib/messageArgs';
import { settings } from '../../../app/settings';

Meteor.startup(() => {
	Tracker.autorun(() => {
		const enabled = settings.get('Message_Read_Receipt_Store_Users');

		if (!enabled) {
			return MessageAction.removeButton('receipt-detail');
		}

		MessageAction.addButton({
			id: 'receipt-detail',
			icon: 'info-circled',
			label: 'Info',
			context: ['starred', 'message', 'message-mobile', 'threads'],
			action() {
				const { msg: message } = messageArgs(this);
				modal.open({
					title: t('Info'),
					content: 'readReceipts',
					data: {
						messageId: message._id,
						senderId: message.u._id
					},
					showConfirmButton: true,
					showCancelButton: false,
					confirmButtonText: t('Close')
				});
				callbacks.run('userClickForMessageInfo');
			},
			order: 1,
			group: 'menu'
		});
	});
});
