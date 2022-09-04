import { WebApp } from 'meteor/webapp';
import parser from 'ua-parser-js';

import { settings } from '../../../../app/settings/server';
import { getURL } from '../../../../app/utils/lib/getURL';
import { Logger } from '../../../../app/logger';

const logger = new Logger('Browser Version');

return WebApp.connectHandlers.use(function (req, res, next) {
	let disallowedBrowsers;
	let allowedBrowsers;
	try {
		disallowedBrowsers = JSON.parse(settings.get('Disallowed_Browsers'));
		allowedBrowsers = JSON.parse(settings.get('Allowed_Browsers'));
	} catch (error) {
		logger.error(
			`Error parsing Disallowed_Browsers/Allowed_Browsers, with error: ${error}.`
		);
		return next();
	}

	const ANDROID_USER_AGENT_IDENTIFIER = 'android';

	const userAgent = req.headers['user-agent'];

	if (
		!userAgent ||
		userAgent.toLowerCase().includes(ANDROID_USER_AGENT_IDENTIFIER)
	) {
		return next();
	}

	let result;

	try {
		result = parser(userAgent);
	} catch (error) {
		logger.error(`Error parsing userAgent, with error: ${error}.`);
		return next();
	}

	const browserName = result?.browser.name;
	const browserVersion = parseInt(result?.browser.version);

	if (!browserName || !browserVersion) {
		return next();
	}

	const isBrowserNameAllowed = !disallowedBrowsers?.includes(browserName);
	const browserSettings = allowedBrowsers?.find(
		browser => browser.name === browserName
	);
	const isBrowserVersionAllowed =
		browserSettings && browserVersion > browserSettings.fromVersion;

	if (isBrowserNameAllowed && isBrowserVersionAllowed) {
		return next();
	}

	const electronLink = settings.get('Electron_Link');
	const header = settings.get('Browser_Support_Header');
	const seconderyHeader = settings.get('Browser_Support_Secondery_Header');
	const buttonText = settings.get('Browser_Support_Button_Text');
	const tooltipText = settings.get('Browser_Support_Tooltip_Text');

	const buttonColor = '#0073A1';

	res.setHeader('content-type', 'text/html; charset=utf-8');

	res.write(`
		<style>
			@font-face {
  				font-family: Assistant;
				font-weight: 700;
				src: url(${getURL('/fonts/Assistant-Bold.ttf')});
				src:
					url(${getURL('/fonts/Assistant-Bold.eot?#iefix')}) format('embedded-opentype'),
					url(${getURL('/fonts/Assistant-Bold.woff2')}) format('woff2'),
					url(${getURL('/fonts/Assistant-Bold.woff')}) format('woff'),
					url(${getURL('/fonts/Assistant-Bold.ttf')}) format('truetype');
			}
			body {
				margin: 0;
				font-family: Assistant;
				text-align:center;
			}

			.rcx-box--text-style-headline {
				letter-spacing: 0rem;
				font-size: 1.375rem;
				line-height: 2rem;
			}

			.not-supported-browser {
				width: 100%;
				height: 100%;
				text-align: center;
				background-image: url(${getURL('/images/unsupportedBrowser.svg')});
				background-repeat: no-repeat;
				background-position: center;
				background-size: cover;
				display: flex;
				justify-content: center;
				align-items: center;
			}

			.not-supported-browser__text {
				min-height: 35vh;
				font-size: 5em;
			}

			.not-supported-browser__secondery-text {
				min-height: 10vh;
				font-size: 4em;
			}

			.rcx-box--text-color-alternative {
				color: white;
			}

			.rcx-box, .rcx-box::before, .rcx-box::after {
				box-sizing: border-box;
				margin: 0;
				padding: 0;
				transition: all 230ms;
				border-width: 0;
				border-style: solid;
				border-color: currentColor;
				outline: none;
				-webkit-font-smoothing: antialiased;
				-moz-osx-font-smoothing: grayscale;
				font-variant-numeric: tabular-nums;
			}

			.rcx-button--primary {
				color: white;
				border-width: 0.125rem;
				border-style: solid;
				border-color: ${buttonColor};
				border-radius: 0.125rem;
				background-color: ${buttonColor};
				-webkit-appearance: none;
				-moz-appearance: none;
				appearance: none;
			}

			.rcx-box--text-color-primary {
				color: ${buttonColor};
			}
			.rcx-box.rcx-\@s6mi60{margin:0.75rem !important;}.rcx-box.rcx-\@19aubzx{margin:2rem !important;}.rcx-box.rcx-\@1kgm1vs{-webkit-align-items:center !important;-webkit-box-align:center !important;-ms-flex-align:center !important;align-items:center !important;-webkit-box-pack:center !important;-webkit-justify-content:center !important;-ms-flex-pack:center !important;justify-content:center !important;-webkit-flex-direction:column !important;-ms-flex-direction:column !important;flex-direction:column !important;}.rcx-box.rcx-\@1qvl0ud{display:-webkit-box !important;display:-webkit-flex !important;display:-ms-flexbox !important;display:flex !important;}
			.rcx-button {
			  	position: relative;
			 	display: inline-block;
				text-align: center;
				vertical-align: middle;
				text-decoration: none;
				cursor: pointer;
				font-size: 2.5rem;
				width: 260px;
				margin-top: 30px;
				text-overflow: ellipsis;
				padding: 7px 15px;
				padding-top: 7px;
				padding-bottom: 7px;
				padding-block: 7px;
				padding-left: 15px;
				padding-right: 15px;
				padding-inline: 15px;
				border-radius: 20px;
			}

			.rcx-button .tooltip {
			  	visibility: hidden;
			  	width: 520px;
			  	background-color: rgba(255, 255, 255, 0.4);
			  	color: white;
			  	text-align: center;
			  	font-size: 1.5rem;
			  	border-radius: 10px;
			  	padding: 10px 0;
			  	position: absolute;
			  	z-index: 1;
			  	top: 125%;
			  	left: 50%;
			  	margin-left: -260px;
			  	opacity: 0;
			  	transition: opacity 0.3s;
			  	line-height: 2rem;
			}

			.rcx-button:hover .tooltip {
			  visibility: visible;
			  opacity: 1;
			}

		</style>

		<section class="rcx-box not-supported-browser rcx-@1kgm1vs rcx-@1qvl0ud" dir="rtl">
			<div class="rcx-box">
				<div class="rcx-box rcx-box--text-color-alternative not-supported-browser__text">${header}</div>
				<div class="rcx-box rcx-box--text-color-alternative not-supported-browser__secondery-text">${seconderyHeader}</div>
				<a class="rcx-button rcx-button--primary electron" href="${electronLink}">${buttonText}
				  <span class="tooltip">${tooltipText}</span>
				</a>
			</div>
		</section>
	`);

	return res.end();
});
