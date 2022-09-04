import { Template } from 'meteor/templating';
import './messageBoxReplyPreview.html';
import { emojiParser } from '../../../emoji/client/emojiParser';

const removeHTMLTags = massage => massage.replace(/<\/?[^>]+(>|$)/g, '');

const parseEmoji = massage =>
	removeHTMLTags(emojiParser({ html: massage.msg }).html);

Template.messageBoxReplyPreview.helpers({
	attachments() {
		const { replyMessageData } = this;
		return [
			{
				text: parseEmoji(replyMessageData),
				author_name: replyMessageData.u.name
			}
		];
	}
});

Template.messageBoxReplyPreview.events({
	'click .cancel-reply'(event) {
		event.preventDefault();
		event.stopPropagation();

		const { mid } = event.currentTarget.dataset;
		const $input = $(this.input);

		this.input.focus();
		const messages = $input.data('reply') || [];
		const filtered = messages.filter(({ _id }) => _id !== mid);

		$input.data('reply', filtered).trigger('dataChange');
	}
});
