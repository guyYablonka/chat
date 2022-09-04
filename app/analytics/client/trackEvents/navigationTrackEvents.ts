import { callbacks } from '../../../callbacks/client';
import { trackEvent } from '../trackEvents';
import navigationEvents from '../trackCategories/navigationEvents.json';

const addNavigationTrackEvents = () => {
    navigationEvents.forEach(navigationEvent => {
        const { callbackName, eventName, piwikCode } = navigationEvent;

        callbacks.add(
            callbackName,
            (state: string) => {
                trackEvent('Navigation', eventName, state);
            },
            callbacks.priority.MEDIUM,
            piwikCode
        );
    });
};

export default addNavigationTrackEvents;
