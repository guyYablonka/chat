import { format, level, transports, addColors } from 'winston';
import httpContext from 'express-http-context';
import stringify from 'fast-safe-stringify';
const {
	combine,
	timestamp,
	errors,
	printf,
	prettyPrint,
	colorize,
	simple,
	json
} = format;

const enviroment = process.env.NODE_ENV || 'development';

export const loggerLevels = {
	levels: {
		info: 1,
		error: 0,
		debug: 2,
		warn: 1,
		api: 0,
		method: 0,
		publish: 0,
		http: 1
	},
	colors: {
		info: 'bold green',
		error: 'bold red',
		debug: 'cyan',
		warn: 'bold yellow',
		api: 'gray',
		method: 'magenta',
		publish: 'magenta',
		http: 'italic white'
	}
};

const colorizer = format.colorize();

const circularReplacer = (key, value) => {
	if (typeof value === 'object' && value !== null) {
		if (value === '[Circular]') {
			return 'Already exists';
		}

		if (value instanceof Buffer) {
			return value.toString('base64');
		}
	}

	if (typeof value === 'bigint') {
		return value.toString();
	}

	return value;
};

const parseLog = ({ message, level, stack, ...params }) =>
	colorizer.colorize(
		level,
		`${level} => ${message}${stack ? '\n' + stack : ''}\n${stringify(
			params,
			circularReplacer,
			2
		)}`
	);

const dev = {
	levels: loggerLevels.levels,
	level: 'debug',
	exitOnError: false,
	maxSize: '100000',
	handleExceptions: true,
	transports: [
		new transports.Console({
			prettyPrint: true,
			colorize: true,
			timestamp: true
		})
	],
	format: combine(
		timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
		simple(),
		printf(parseLog)
	)
};

const prod = {
	...dev,
	format: combine(
		timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
		json({ replacer: circularReplacer }),
		prettyPrint()
	),
	hideFields: ['password', 'pass', 'fileData', 'process']
};

export const loggerConfig = enviroment === 'production' ? prod : dev;
