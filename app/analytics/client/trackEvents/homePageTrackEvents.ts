import { settings } from '../../../settings/client';
import { callbacks } from '../../../callbacks/client';
import { trackEvent } from '../trackEvents';
import homePageEvents from '../trackCategories/homePageEvents.json';

const addHomePageTrackEvents = () => {
    homePageEvents.forEach(homePageEvent => {
        const { callbackName, eventName, piwikCode } = homePageEvent;

        callbacks.add(
            callbackName,
            () => {
                if (settings.get('Analytics_features_rooms')) {
                    trackEvent('Home', eventName);
                }
            },
            callbacks.priority.MEDIUM,
            piwikCode
        );
    });
};

export default addHomePageTrackEvents;
