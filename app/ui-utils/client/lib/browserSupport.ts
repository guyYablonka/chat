import parser from 'ua-parser-js';
const CHROME_BROWSERS = ['Chrome', 'Chromium'];

export const isVersionBiggerThan = (version: number) => {
    const browser = parser(navigator.userAgent).browser;

    return parseInt(browser.version ?? '0') > version;
};

export const isBrowserChrome = () =>
    CHROME_BROWSERS.includes(parser(navigator.userAgent).browser.name ?? '');
