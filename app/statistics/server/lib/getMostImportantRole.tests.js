import { getMostImportantRole } from './getMostImportantRole';

describe('getMostImportantRole', () => {
	it('should return the same role if only one exists', () => {
		expect(getMostImportantRole(['admin'])).toBe('admin');
		expect(getMostImportantRole(['livechat-manager'])).toBe(
			'livechat-manager'
		);
		expect(getMostImportantRole(['livechat-monitor'])).toBe(
			'livechat-monitor'
		);
		expect(getMostImportantRole(['livechat-agent'])).toBe('livechat-agent');
		expect(getMostImportantRole(['user'])).toBe('user');
		expect(getMostImportantRole(['guest'])).toBe('guest');
		expect(getMostImportantRole(['anonymous'])).toBe('anonymous');
		expect(getMostImportantRole(['app'])).toBe('app');
		expect(getMostImportantRole(['bot'])).toBe('bot');
	});

	it('should return custom roles as `custom-role`', () => {
		expect(getMostImportantRole(['custom1'])).toBe('custom-role');
	});

	it('should return auditor, app and bot as `user`', () => {
		expect(getMostImportantRole(['auditor'])).toBe('user');
		expect(getMostImportantRole(['auditor-log'])).toBe('user');
	});

	it('should return `no-role` if no one exists', () => {
		expect(getMostImportantRole([])).toBe('no-role');
		expect(getMostImportantRole()).toBe('no-role');
	});

	it('should return correct role', () => {
		expect(getMostImportantRole(['user', 'admin'])).toBe('admin');
		expect(getMostImportantRole(['user', 'anonymous'])).toBe('user');
		expect(getMostImportantRole(['user', 'guest'])).toBe('user');
		expect(
			getMostImportantRole(['user', 'guest', 'livechat-monitor'])
		).toBe('livechat-monitor');
		expect(getMostImportantRole(['user', 'custom1'])).toBe('custom-role');
		expect(getMostImportantRole(['custom2', 'user', 'custom1'])).toBe(
			'custom-role'
		);
		expect(getMostImportantRole(['custom2', 'admin', 'custom1'])).toBe(
			'admin'
		);
		expect(getMostImportantRole(['custom2', 'app'])).toBe('custom-role');
		expect(getMostImportantRole(['anonymous', 'app'])).toBe('app');
	});
});
