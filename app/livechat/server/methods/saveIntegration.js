import { Meteor } from 'meteor/meteor';
import s from 'underscore.string';

import { hasPermission } from '../../../authorization';
import { settings } from '../../../settings';

Meteor.methods({
	'livechat:saveIntegration'(values) {
		if (
			!Meteor.userId() ||
			!hasPermission(Meteor.userId(), 'view-livechat-manager')
		) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'livechat:saveIntegration'
			});
		}

		if (typeof values.Livechat_webhookUrl !== 'undefined') {
			settings.updateById(
				'Livechat_webhookUrl',
				s.trim(values.Livechat_webhookUrl)
			);
		}

		if (typeof values.Livechat_secret_token !== 'undefined') {
			settings.updateById(
				'Livechat_secret_token',
				s.trim(values.Livechat_secret_token)
			);
		}

		if (typeof values.Livechat_webhook_on_start !== 'undefined') {
			settings.updateById(
				'Livechat_webhook_on_start',
				!!values.Livechat_webhook_on_start
			);
		}

		if (typeof values.Livechat_webhook_on_close !== 'undefined') {
			settings.updateById(
				'Livechat_webhook_on_close',
				!!values.Livechat_webhook_on_close
			);
		}

		if (typeof values.Livechat_webhook_on_chat_taken !== 'undefined') {
			settings.updateById(
				'Livechat_webhook_on_chat_taken',
				!!values.Livechat_webhook_on_chat_taken
			);
		}

		if (typeof values.Livechat_webhook_on_chat_queued !== 'undefined') {
			settings.updateById(
				'Livechat_webhook_on_chat_queued',
				!!values.Livechat_webhook_on_chat_queued
			);
		}

		if (typeof values.Livechat_webhook_on_forward !== 'undefined') {
			settings.updateById(
				'Livechat_webhook_on_forward',
				!!values.Livechat_webhook_on_forward
			);
		}

		if (typeof values.Livechat_webhook_on_offline_msg !== 'undefined') {
			settings.updateById(
				'Livechat_webhook_on_offline_msg',
				!!values.Livechat_webhook_on_offline_msg
			);
		}

		if (typeof values.Livechat_webhook_on_visitor_message !== 'undefined') {
			settings.updateById(
				'Livechat_webhook_on_visitor_message',
				!!values.Livechat_webhook_on_visitor_message
			);
		}

		if (typeof values.Livechat_webhook_on_agent_message !== 'undefined') {
			settings.updateById(
				'Livechat_webhook_on_agent_message',
				!!values.Livechat_webhook_on_agent_message
			);
		}
	}
});
