import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import { callbacks } from '../../../app/callbacks';
import { getUserPreference } from '../../../app/utils';

Meteor.startup(() => {
	Tracker.autorun(() => {
		const isEnabled =
			getUserPreference(Meteor.userId(), 'highlights')?.some(highlight =>
				highlight?.trim()
			) ?? false;

		if (!isEnabled) {
			callbacks.remove('renderMessage', 'highlight-words');
			return;
		}

		const options = {
			wordsToHighlight: getUserPreference(
				Meteor.userId(),
				'highlights'
			).filter(highlight => highlight?.trim())
		};

		import('../../../app/highlight-words').then(
			({ createHighlightWordsMessageRenderer }) => {
				const renderMessage = createHighlightWordsMessageRenderer(
					options
				);
				callbacks.remove('renderMessage', 'highlight-words');
				callbacks.add(
					'renderMessage',
					renderMessage,
					callbacks.priority.MEDIUM + 1,
					'highlight-words'
				);
			}
		);
	});
});
