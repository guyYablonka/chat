import { replaceVariables } from '../server/utils.js';

describe('Mailer-API', () => {
	describe('translate', () => {
		const i18n = {
			key: 'value'
		};

		describe('single key', () => {
			it(`should be equal to test ${i18n.key}`, () => {
				expect(`test ${i18n.key}`).toEqual(
					replaceVariables('test {key}', (match, key) => i18n[key])
				);
			});
		});

		describe('multiple keys', () => {
			it(`should be equal to test ${i18n.key} and ${i18n.key}`, () => {
				expect(`test ${i18n.key} and ${i18n.key}`).toEqual(
					replaceVariables(
						'test {key} and {key}',
						(match, key) => i18n[key]
					)
				);
			});
		});

		describe('key with a trailing space', () => {
			it(`should be equal to test ${i18n.key}`, () => {
				expect(`test ${i18n.key}`).toEqual(
					replaceVariables('test {key }', (match, key) => i18n[key])
				);
			});
		});

		describe('key with a leading space', () => {
			it(`should be equal to test ${i18n.key}`, () => {
				expect(`test ${i18n.key}`).toEqual(
					replaceVariables('test { key}', (match, key) => i18n[key])
				);
			});
		});

		describe('key with leading and trailing spaces', () => {
			it(`should be equal to test ${i18n.key}`, () => {
				expect(`test ${i18n.key}`).toEqual(
					replaceVariables('test { key }', (match, key) => i18n[key])
				);
			});
		});

		describe('key with multiple words', () => {
			it(`should be equal to test ${i18n.key}`, () => {
				expect(`test ${i18n.key}`).toEqual(
					replaceVariables(
						'test {key ignore}',
						(match, key) => i18n[key]
					)
				);
			});
		});

		describe('key with multiple opening brackets', () => {
			it(`should be equal to test {${i18n.key}`, () => {
				expect(`test {${i18n.key}`).toEqual(
					replaceVariables('test {{key}', (match, key) => i18n[key])
				);
			});
		});

		describe('key with multiple closing brackets', () => {
			it(`should be equal to test ${i18n.key}}`, () => {
				expect(`test ${i18n.key}}`).toEqual(
					replaceVariables('test {key}}', (match, key) => i18n[key])
				);
			});
		});

		describe('key with multiple opening and closing brackets', () => {
			it(`should be equal to test {${i18n.key}}`, () => {
				expect(`test {${i18n.key}}`).toEqual(
					replaceVariables('test {{key}}', (match, key) => i18n[key])
				);
			});
		});
	});
});
