import url from 'url';

import _ from 'underscore';
import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';

import { settings } from '../../settings/server';

WebApp.connectHandlers.use(
	'/livechat',
	Meteor.bindEnvironment((req, res, next) => {
		const reqUrl = url.parse(req.url);
		if (reqUrl.pathname !== '/') {
			return next();
		}

		res.setHeader('content-type', 'text/html; charset=utf-8');

		let domainWhiteList = settings.get('Livechat_AllowedDomainsList');
		if (req.headers.referer && !_.isEmpty(domainWhiteList.trim())) {
			domainWhiteList = _.map(
				domainWhiteList.split(','),
				function (domain) {
					return domain.trim();
				}
			);

			const referer = url.parse(req.headers.referer);
			if (!_.contains(domainWhiteList, referer.host)) {
				res.setHeader(
					'Content-Security-Policy',
					"frame-ancestors 'none'"
				);
				return next();
			}

			res.setHeader(
				'Content-Security-Policy',
				`frame-ancestors ${referer.protocol}//${referer.host}`
			);
		}

		res.end();
	})
);
