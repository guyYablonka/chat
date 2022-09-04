import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Template } from 'meteor/templating';
import { settings } from '../../settings';

const matomoTrackingCode = (_paq, username, piwikSiteId, piwikUrl) => {
	_paq.push(['setUserId', username]);
	_paq.push(['trackPageView']);
	_paq.push(['enableLinkTracking']);
	_paq.push(['setTrackerUrl', `${piwikUrl}piwik.php`]);
	_paq.push(['setSiteId', Number.parseInt(piwikSiteId)]);
	const d = document;
	const g = d.createElement('script');
	const s = d.getElementsByTagName('script')[0];
	g.type = 'text/javascript';
	g.async = true;
	g.defer = true;
	g.src = `${piwikUrl}piwik.js`;
	s.parentNode.insertBefore(g, s);
};

const trackPageTitle = (_paq, piwikPrependDomain) => {
	if (piwikPrependDomain) {
		_paq.push([
			'setDocumentTitle',
			`${window.location.hostname}/${document.title}`
		]);
	}
};

const trackOnlyOneDomain = (_paq, piwikCookieDomain) => {
	if (piwikCookieDomain) {
		const upperLevelDomain = `*.${window.location.hostname
			.split('.')
			.slice(1)
			.join('.')}`;
		_paq.push(['setCookieDomain', upperLevelDomain]);
	}
};

const hideOutgoingLinks = (_paq, piwikDomains) => {
	if (piwikDomains) {
		// array
		const domainsArray = piwikDomains.split(/\n/);
		const domains = [];
		for (let i = 0; i < domainsArray.length; i++) {
			// only push domain if it contains a non whitespace character.
			if (/\S/.test(domainsArray[i])) {
				domains.push(`*.${domainsArray[i].trim()}`);
			}
		}
		_paq.push(['setDomains', domains]);
	}
};

const addAdditionalMatomoSites = (_paq, piwikAdditionalTracker) => {
	try {
		if (/\S/.test(piwikAdditionalTracker)) {
			// piwikAdditionalTracker is not empty or whitespace only
			const addTrackers = JSON.parse(piwikAdditionalTracker);
			for (let i = 0; i < addTrackers.length; i++) {
				const tracker = addTrackers[i];
				_paq.push([
					'addTracker',
					`${tracker.trackerURL}js/`,
					tracker.siteId
				]);
			}
		}
	} catch (e) {
		// parsing JSON faild

		console.log(
			'Error while parsing JSON value of "piwikAdditionalTracker": ',
			e
		);
	}
};

Template.body.onRendered(() => {
	Tracker.autorun(c => {
		const piwikUrl =
			settings.get('PiwikAnalytics_enabled') &&
			settings.get('PiwikAnalytics_url');
		const piwikSiteId = piwikUrl && settings.get('PiwikAnalytics_siteId');
		const piwikPrependDomain =
			piwikUrl && settings.get('PiwikAnalytics_prependDomain');
		const piwikCookieDomain =
			piwikUrl && settings.get('PiwikAnalytics_cookieDomain');
		const piwikDomains = piwikUrl && settings.get('PiwikAnalytics_domains');
		const piwikAdditionalTracker =
			piwikUrl && settings.get('PiwikAdditionalTrackers');
		const username = Meteor.user()?.username;

		if (piwikSiteId && username) {
			c.stop();
			window._paq = window._paq || [];

			trackPageTitle(window._paq, piwikPrependDomain);
			trackOnlyOneDomain(window._paq, piwikCookieDomain);
			hideOutgoingLinks(window._paq, piwikDomains);
			addAdditionalMatomoSites(window._paq, piwikAdditionalTracker);
			matomoTrackingCode(window._paq, username, piwikSiteId, piwikUrl);
		}
	});
});
