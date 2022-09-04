import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Tracker } from 'meteor/tracker';
import trackEvents from './trackEvents/index.ts';
import { settings } from '../../settings';

export const trackEvent = (category, action, label) => {
	if (window._paq) {
		window._paq.push(['trackEvent', category, action, label]);
	}
	if (window.ga) {
		window.ga('send', 'event', category, action, label);
	}
};

if (!window._paq || window.ga) {
	// Trigger the trackPageView manually as the page views are only loaded when the loadScript.js code is executed
	FlowRouter.triggers.enter([
		route => {
			if (window._paq) {
				const http = location.protocol;
				const slashes = http.concat('//');
				const host = slashes.concat(window.location.hostname);
				window._paq.push(['setCustomUrl', host + route.path]);
				window._paq.push(['trackPageView']);
			}
			if (window.ga) {
				window.ga('send', 'pageview', route.path);
			}
		}
	]);

	// Users
	// Track logins and associate user ids with piwik
	() => {
		let oldUsername = null;

		Tracker.autorun(() => {
			const newUsername = Meteor.user()?.username;
			const shouldTrackEvent =
				window._paq && settings.get('Analytics_features_users');

			if (shouldTrackEvent) {
				if (oldUsername === null && newUsername) {
					trackEvent('User', 'Login', newUsername);
					window._paq.push(['setUserId', newUsername]);
				} else if (newUsername === null && oldUsername) {
					trackEvent('User', 'Logout', oldUsername);
				}
			}

			oldUsername = Meteor.user()?.username;
		});
	};

	trackEvents.forEach(func => func());
}
