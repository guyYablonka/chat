import { settings } from '../../../settings/client';
import { callbacks } from '../../../callbacks/client';
import { trackEvent } from '../trackEvents';
import userEvents from '../trackCategories/userEvents.json';

const addUserTrackEvents = () => {
    userEvents.forEach(userEvent => {
        const { callbackName, eventName, piwikCode } = userEvent;

        callbacks.add(
            callbackName,
            (args: {}) => {
                if (settings.get('Analytics_features_users')) {
                    trackEvent('User', eventName, args);
                }
            },
            callbacks.priority.MEDIUM,
            piwikCode
        );
    });
};

export default addUserTrackEvents;
