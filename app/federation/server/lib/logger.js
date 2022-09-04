import { Logger } from '../../../logger/server';

export const logger = new Logger(
	'Federation',
	{
		sections: {
			client: 'client',
			crypt: 'crypt',
			dns: 'dns',
			web: 'web',
			server: 'server',
			setup: 'Setup'
		}
	},
	__filename
);
