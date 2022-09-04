import { callbacks } from '../../../callbacks/client';
import { settings } from '../../../settings/client';
import { ChatRoom } from '../../../models/client';
import { trackEvent } from '../trackEvents';
import messageEvents from '../trackCategories/messageEvents.json';

const addMessageTrackEvents = () => {
    callbacks.add(
        'afterSaveMessage',
        (message: { rid: string }) => {
            if (
                ((window as any)._paq || (window as any).ga) &&
                settings.get('Analytics_features_messages')
            ) {
                const room = ChatRoom.findOne({ _id: message.rid });
                trackEvent('Message', 'Send', `${room.name} (${room._id})`);
            }
        },
        2000,
        'trackEvents'
    );

    messageEvents.forEach(messageEvent => {
        const { callbackName, eventName, piwikCode } = messageEvent;

        callbacks.add(
            callbackName,
            () => {
                if (settings.get('Analytics_features_messages')) {
                    trackEvent('Message', eventName);
                }
            },
            callbacks.priority.MEDIUM,
            piwikCode
        );
    });
};

export default addMessageTrackEvents;
