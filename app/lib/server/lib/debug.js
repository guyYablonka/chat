import { Meteor } from 'meteor/meteor';
import _ from 'underscore';

import { settings } from '../../../settings';
import { metrics } from '../../../metrics';
import { Logger } from '../../../logger';

const logger = new Logger('Meteor', {}, __filename);

let Log_Trace_Methods;
let Log_Trace_Subscriptions;
settings.get('Log_Trace_Methods', (key, value) => {
	Log_Trace_Methods = value;
});
settings.get('Log_Trace_Subscriptions', (key, value) => {
	Log_Trace_Subscriptions = value;
});

let Log_Trace_Methods_Filter;
let Log_Trace_Subscriptions_Filter;
settings.get('Log_Trace_Methods_Filter', (key, value) => {
	Log_Trace_Methods_Filter = value ? new RegExp(value) : undefined;
});
settings.get('Log_Trace_Subscriptions_Filter', (key, value) => {
	Log_Trace_Subscriptions_Filter = value ? new RegExp(value) : undefined;
});

const traceConnection = (enable, filter, prefix, name, connection, userId) => {
	if (!enable) {
		return;
	}

	if (filter && !filter.test(name)) {
		return;
	}

	const level = prefix === 'method' ? 'method' : 'publish';
	if (connection) {
		logger[level](`${name} trace`, {
			sessionId: connection.sessionId || connection.id,
			clientAddress: connection.clientAddress,
			httpHeaders: connection.httpHeaders,
			userId
		});
	} else {
		logger[level](`${name} trace`, 'no-connection');
	}
};

const omitKeyArgs = (args, name) => {
	if (name === 'saveSettings') {
		return [args[0].map(arg => _.omit(arg, 'value'))];
	}

	if (name === 'saveSetting') {
		return [args[0], args[2]];
	}

	return args.map(arg =>
		typeof arg !== 'object'
			? arg
			: _.omit(arg, 'password', 'msg', 'pass', 'message')
	);
};

const wrapMethods = function (name, originalHandler, methodsMap) {
	methodsMap[name] = function (...originalArgs) {
		const self = this;
		traceConnection(
			Log_Trace_Methods,
			Log_Trace_Methods_Filter,
			'method',
			name,
			this.connection,
			this.userId
		);
		const end = metrics.meteorMethods.startTimer({
			method: name === 'stream' ? `${name}:${originalArgs[0]}` : name,
			has_connection: this.connection != null,
			has_user: this.userId != null
		});
		const args =
			name === 'ufsWrite'
				? Array.prototype.slice.call(originalArgs, 1)
				: originalArgs;

		if (Log_Trace_Methods) {
			logger.method(`${name} -> method arguments`, {
				arguments: omitKeyArgs(args, name),
				sessionId: this.connection.id || this.connection.sessionId
			});
		}
		try {
			const result = originalHandler.apply(this, originalArgs);
			end();
			return result;
		} catch (e) {
			logger.error(`${name} -> method error -> ${e.message}`, {
				userId: self.userId,
				sessionId: self.connection.sessionId || self.connection.id,
				methodName: name,
				stack: e.stack,
				...e
			});
			throw e;
		}
	};
};

const originalMeteorMethods = Meteor.methods;

Meteor.methods = function (methodMap) {
	_.each(methodMap, function (handler, name) {
		wrapMethods(name, handler, methodMap);
	});
	originalMeteorMethods(methodMap);
};

const originalMeteorPublish = Meteor.publish;

Meteor.publish = function (name, func) {
	return originalMeteorPublish(name, function (...args) {
		const self = this;
		traceConnection(
			Log_Trace_Subscriptions,
			Log_Trace_Subscriptions_Filter,
			'subscription',
			name,
			this.connection,
			this.userId
		);

		if (Log_Trace_Subscriptions) {
			logger.publish(`${name} -> subscription arguments`, {
				arguments: omitKeyArgs(args),
				sessionId: this.connection.id || this.connection.sessionId
			});
		}

		const end = metrics.meteorSubscriptions.startTimer({
			subscription: name
		});

		const originalReady = this.ready;
		this.ready = function () {
			end();
			return originalReady.apply(this, args);
		};
		try {
			return func.apply(this, args);
		} catch (e) {
			logger.error(`${name} -> subscription error -> ${e.message}`, {
				userId: self.userId,
				sessionId: self.connection.sessionId || self.connection.id,
				subscriptionName: name,
				stack: e.stack,
				...e
			});
			throw e;
		}
	});
};
