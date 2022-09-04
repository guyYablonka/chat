import { EventEmitter } from 'events';
import httpContext from 'express-http-context';
import { createLogger, addColors } from 'winston';
import { loggerConfig, loggerLevels } from './config';

import _ from 'underscore';
import s from 'underscore.string';
import { options } from 'i18next';
import { Users } from '/app/models/server';
export const LoggerManager = new (class extends EventEmitter {
	constructor() {
		super();
		this.enabled = false;
		this.loggers = {};
		this.queue = [];
		this.showPackage = false;
		this.showFileAndLine = false;
		this.logLevel = 0;
		this.parentLogger = createLogger(loggerConfig);
		this.levels = loggerLevels.levels;
		addColors(loggerLevels.colors);
	}

	register(logger) {
		// eslint-disable-next-line no-use-before-define
		if (!(logger instanceof Logger)) {
			return;
		}
		this.loggers[logger.name] = logger;
		this.emit('register', logger);
	}

	addToQueue(logger, args) {
		this.queue.push({
			logger,
			args
		});
	}

	dispatchQueue() {
		_.each(this.queue, item =>
			item.logger._log.apply(item.logger, item.args)
		);
		this.clearQueue();
	}

	clearQueue() {
		this.queue = [];
	}

	disable() {
		this.enabled = false;
	}

	enable(dispatchQueue = false) {
		this.enabled = true;
		return dispatchQueue === true
			? this.dispatchQueue()
			: this.clearQueue();
	}
})();

export class Logger {
	constructor(name, config = {}, filename) {
		const self = this;
		this.name = name;
		this.filename = filename;

		this.config = Object.assign({}, config);
		if (LoggerManager.loggers && LoggerManager.loggers[this.name] != null) {
			LoggerManager.loggers[this.name].warn('Duplicated instance');
			return LoggerManager.loggers[this.name];
		}

		LoggerManager.register(this);

		Object.keys(LoggerManager.levels).map(level => {
			self[level] = (message, params = {}) =>
				self._log({ level }, message, params);
		});

		if (config.methods) {
			Object.entries(config.methods).map(([key, value]) => {
				self[key] = (message, params = {}) =>
					self._log(
						{ level: value?.type, method: key },
						message,
						params
					);
			});
		}

		if (config.sections) {
			Object.entries(config.sections).map(([key, value]) => {
				self[key] = {};
				Object.keys(LoggerManager.levels).map(level => {
					self[key][level] = (message, params = {}) =>
						self._log({ level, section: value }, message, params);
				});
			});
		}
	}

	_getCallerDetails(level) {
		const details = {};

		const { stack } = new Error();
		if (!stack) {
			return details;
		}

		const lines = stack.split('\n').splice(1);
		// looking for the first line outside the logging package (or an
		// eval if we find that first)
		let line = lines[0];
		for (
			let index = 0, len = lines.length;
			index < len;
			index++, line = lines[index]
		) {
			if (line.match(/^\s*at eval \(eval/)) {
				return { file: 'eval' };
			}

			if (!line.match(/logger\/server(?:\/|\.js)/)) {
				break;
			}
		}

		const stackParts = line.split(' ');

		if (stackParts.length) {
			if (stackParts.length > 2 && stackParts[1]) {
				details.function = stackParts[1];
			}

			if (LoggerManager.showFileAndLine || level === 'error') {
				const fileMatch =
					/(?:[@(]| at )([^(]+?):([0-9:]+)(?:\)|$)/.exec(
						stackParts[stackParts.length - 1]
					);
				if (fileMatch) {
					const file = fileMatch[1] || this.filename;
					const line = fileMatch[2] || '';
					details.fileAndLine = `${file}${line ? ':' + line : ''}`;
				}
			}

			if (LoggerManager.showPackage || level === 'error') {
				const packageData = stackParts[stackParts.length - 1].match(
					/packages\/([^\.\/]+)(?:\/|\.)/
				)?.[1];

				if (packageData) {
					return { ...details, package: packageData };
				}
			}
		}

		return details;
	}

	_log({ level, section, method }, message, params) {
		if (LoggerManager.enabled === false) {
			LoggerManager.addToQueue(this, [
				{ level, section, method },
				message,
				params
			]);
			return;
		}

		if (LoggerManager.logLevel < LoggerManager.levels[level]) {
			return;
		}

		LoggerManager.parentLogger[level](
			this.composeMessage({ level, section, method }, message, params)
		);
	}

	composeMessage({ level, section, method }, message, params) {
		const contextData = {
			requestId: httpContext.get('requestId'),
			username: params.username ?? httpContext.get('username'),
			route: httpContext.get('route')
		};

		let result = {
			...this._getCallerDetails(level),
			message,
			serviceName: this.name
		};

		if (section) {
			result.section = section;
		}

		if (method) {
			result.method = method;
		}

		if (_.isArray(params) || typeof params === 'string') {
			result = { data: params, ...result };
		} else {
			result = { ...params, ...result };
		}

		if (contextData.requestId) {
			result = { ...contextData, ...result };
		}

		return result;
	}
}

export const SystemLogger = new Logger(
	'System',
	{
		methods: {
			startup: {
				type: 'info',
				level: 0
			}
		}
	},
	__filename
);
