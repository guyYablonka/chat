import GraphemeSplitter from 'grapheme-splitter';

import { emoji } from '../../emoji';

const splitter = new GraphemeSplitter();

export const removeQuoteUrl = message =>
	message.replace(/^\[ ]\((http[s]?:\/\/)?([^\/\s]+\/)(.*)\)\s{1,2}/gm, '');

export const messageProperties = {
	length: message => splitter.countGraphemes(message),

	messageWithoutEmojiShortnames: message =>
		message.replace(/:\w+:/gm, match => {
			if (emoji.list[match] !== undefined) {
				return ' ';
			}
			return match;
		}),

	messageWithoutQuoteUrl: message => removeQuoteUrl(message)
};
