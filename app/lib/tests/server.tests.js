import PasswordPolicyClass from '../server/lib/PasswordPolicyClass';

describe('PasswordPolicyClass', () => {
	describe('Default options', () => {
		const passwordPolice = new PasswordPolicyClass();
		it('should be disabled', () => {
			expect(passwordPolice.enabled).toEqual(false);
		});
		it('should have minLength = -1', () => {
			expect(passwordPolice.minLength).toEqual(-1);
		});
		it('should have maxLength = -1', () => {
			expect(passwordPolice.maxLength).toEqual(-1);
		});
		it('should have forbidRepeatingCharacters = false', () => {
			expect(passwordPolice.forbidRepeatingCharacters).toEqual(false);
		});
		it('should have forbidRepeatingCharactersCount = 3', () => {
			expect(passwordPolice.forbidRepeatingCharactersCount).toEqual(3);
		});
		it('should have mustContainAtLeastOneLowercase = false', () => {
			expect(passwordPolice.mustContainAtLeastOneLowercase).toEqual(
				false
			);
		});
		it('should have mustContainAtLeastOneUppercase = false', () => {
			expect(passwordPolice.mustContainAtLeastOneUppercase).toEqual(
				false
			);
		});
		it('should have mustContainAtLeastOneNumber = false', () => {
			expect(passwordPolice.mustContainAtLeastOneNumber).toEqual(false);
		});
		it('should have mustContainAtLeastOneSpecialCharacter = false', () => {
			expect(
				passwordPolice.mustContainAtLeastOneSpecialCharacter
			).toEqual(false);
		});

		describe('Password tests with default options', () => {
			it('should allow all passwords', () => {
				const passwordPolice = new PasswordPolicyClass({
					throwError: false
				});
				expect(passwordPolice.validate()).toEqual(false);
				expect(passwordPolice.validate('')).toEqual(false);
				expect(passwordPolice.validate('            ')).toEqual(false);
				expect(passwordPolice.validate('a')).toEqual(true);
				expect(passwordPolice.validate('aaaaaaaaa')).toEqual(true);
			});
		});
	});

	describe('Password tests with options', () => {
		it('should not allow non string or empty', () => {
			const passwordPolice = new PasswordPolicyClass({
				enabled: true,
				throwError: false
			});

			expect(passwordPolice.validate()).toEqual(false);
			expect(passwordPolice.validate(1)).toEqual(false);
			expect(passwordPolice.validate(true)).toEqual(false);
			expect(passwordPolice.validate(new Date())).toEqual(false);
			expect(passwordPolice.validate(new Function())).toEqual(false);
			expect(passwordPolice.validate('')).toEqual(false);
		});

		it('should restrict by minLength', () => {
			const passwordPolice = new PasswordPolicyClass({
				enabled: true,
				minLength: 5,
				throwError: false
			});

			expect(passwordPolice.validate('1')).toEqual(false);
			expect(passwordPolice.validate('1234')).toEqual(false);
			expect(passwordPolice.validate('12345')).toEqual(true);
			expect(passwordPolice.validate('     ')).toEqual(false);
		});

		it('should restrict by maxLength', () => {
			const passwordPolice = new PasswordPolicyClass({
				enabled: true,
				maxLength: 5,
				throwError: false
			});

			expect(passwordPolice.validate('1')).toEqual(true);
			expect(passwordPolice.validate('12345')).toEqual(true);
			expect(passwordPolice.validate('123456')).toEqual(false);
			expect(passwordPolice.validate('      ')).toEqual(false);
		});

		it('should allow repeated characters', () => {
			const passwordPolice = new PasswordPolicyClass({
				enabled: true,
				forbidRepeatingCharacters: false,
				throwError: false
			});

			expect(passwordPolice.validate('1')).toEqual(true);
			expect(passwordPolice.validate('12345')).toEqual(true);
			expect(passwordPolice.validate('123456')).toEqual(true);
			expect(passwordPolice.validate('      ')).toEqual(false);
			expect(passwordPolice.validate('11111111111111')).toEqual(true);
		});

		it('should restrict repeated characters', () => {
			const passwordPolice = new PasswordPolicyClass({
				enabled: true,
				forbidRepeatingCharacters: true,
				forbidRepeatingCharactersCount: 3,
				throwError: false
			});

			expect(passwordPolice.validate('1')).toEqual(true);
			expect(passwordPolice.validate('11')).toEqual(true);
			expect(passwordPolice.validate('111')).toEqual(true);
			expect(passwordPolice.validate('1111')).toEqual(false);
			expect(passwordPolice.validate('     ')).toEqual(false);
			expect(passwordPolice.validate('123456')).toEqual(true);
		});

		it('should restrict repeated characters customized', () => {
			const passwordPolice = new PasswordPolicyClass({
				enabled: true,
				forbidRepeatingCharacters: true,
				forbidRepeatingCharactersCount: 5,
				throwError: false
			});

			expect(passwordPolice.validate('1')).toEqual(true);
			expect(passwordPolice.validate('11')).toEqual(true);
			expect(passwordPolice.validate('111')).toEqual(true);
			expect(passwordPolice.validate('1111')).toEqual(true);
			expect(passwordPolice.validate('11111')).toEqual(true);
			expect(passwordPolice.validate('111111')).toEqual(false);
			expect(passwordPolice.validate('      ')).toEqual(false);
			expect(passwordPolice.validate('123456')).toEqual(true);
		});

		it('should contain one lowercase', () => {
			const passwordPolice = new PasswordPolicyClass({
				enabled: true,
				mustContainAtLeastOneLowercase: true,
				throwError: false
			});

			expect(passwordPolice.validate('a')).toEqual(true);
			expect(passwordPolice.validate('aa')).toEqual(true);
			expect(passwordPolice.validate('A')).toEqual(false);
			expect(passwordPolice.validate('   ')).toEqual(false);
			expect(passwordPolice.validate('123456')).toEqual(false);
			expect(passwordPolice.validate('AAAAA')).toEqual(false);
			expect(passwordPolice.validate('AAAaAAA')).toEqual(true);
		});

		it('should contain one uppercase', () => {
			const passwordPolice = new PasswordPolicyClass({
				enabled: true,
				mustContainAtLeastOneUppercase: true,
				throwError: false
			});

			expect(passwordPolice.validate('a')).toEqual(false);
			expect(passwordPolice.validate('aa')).toEqual(false);
			expect(passwordPolice.validate('A')).toEqual(true);
			expect(passwordPolice.validate('   ')).toEqual(false);
			expect(passwordPolice.validate('123456')).toEqual(false);
			expect(passwordPolice.validate('AAAAA')).toEqual(true);
			expect(passwordPolice.validate('AAAaAAA')).toEqual(true);
		});

		it('should contain one uppercase', () => {
			const passwordPolice = new PasswordPolicyClass({
				enabled: true,
				mustContainAtLeastOneNumber: true,
				throwError: false
			});

			expect(passwordPolice.validate('a')).toEqual(false);
			expect(passwordPolice.validate('aa')).toEqual(false);
			expect(passwordPolice.validate('A')).toEqual(false);
			expect(passwordPolice.validate('   ')).toEqual(false);
			expect(passwordPolice.validate('123456')).toEqual(true);
			expect(passwordPolice.validate('AAAAA')).toEqual(false);
			expect(passwordPolice.validate('AAAaAAA')).toEqual(false);
			expect(passwordPolice.validate('AAAa1AAA')).toEqual(true);
		});

		it('should contain one uppercase', () => {
			const passwordPolice = new PasswordPolicyClass({
				enabled: true,
				mustContainAtLeastOneSpecialCharacter: true,
				throwError: false
			});

			expect(passwordPolice.validate('a')).toEqual(false);
			expect(passwordPolice.validate('aa')).toEqual(false);
			expect(passwordPolice.validate('A')).toEqual(false);
			expect(passwordPolice.validate('   ')).toEqual(false);
			expect(passwordPolice.validate('123456')).toEqual(false);
			expect(passwordPolice.validate('AAAAA')).toEqual(false);
			expect(passwordPolice.validate('AAAaAAA')).toEqual(false);
			expect(passwordPolice.validate('AAAa1AAA')).toEqual(false);
			expect(passwordPolice.validate('AAAa@AAA')).toEqual(true);
		});
	});
});
