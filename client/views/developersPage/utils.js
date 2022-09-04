import { useSetting } from '../../contexts/SettingsContext';

const formatJsonRules = [
	{ key: /\n/g, value: '' },
	{ key: /\t/g, value: '' },
	{ key: /"/g, value: '\\"' },
	{ key: /'/g, value: "'" }
];

export const formatBodyString = (stringToFormat, keyToFormat) => {
	formatJsonRules.forEach(formatRule => {
		stringToFormat = stringToFormat.replace(
			formatRule.key,
			formatRule.value
		);
	});

	return stringToFormat.replace(new RegExp(keyToFormat, 'g'), '"');
};
