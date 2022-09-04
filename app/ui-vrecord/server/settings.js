import { settings } from '../../settings';

settings.addGroup('Message', function () {
	this.add('Message_VideoRecorderEnabled', false, {
		type: 'boolean',
		public: true,
		i18nDescription: 'Message_VideoRecorderEnabledDescription'
	});
});
