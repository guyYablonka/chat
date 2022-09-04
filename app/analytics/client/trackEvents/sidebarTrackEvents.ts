import { callbacks } from '../../../callbacks/client';
import { trackEvent } from '../trackEvents';
import sidbarEvents from '../trackCategories/sidebarEvents.json';

const addSidebarTrackEvents = () => {
    sidbarEvents.forEach(sidbarEvent => {
        const { callbackName, eventName, piwikCode } = sidbarEvent;

        callbacks.add(
            callbackName,
            () => {
                trackEvent('Sidebar', eventName);
            },
            callbacks.priority.MEDIUM,
            piwikCode
        );
    });
};

export default addSidebarTrackEvents;
