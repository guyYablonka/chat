import { settings } from '../../../settings/client';
import { callbacks } from '../../../callbacks/client';
import { trackEvent } from '../trackEvents';
import roomEvents from '../trackCategories/roomEvents.json';

const addRoomTrackEvents = () => {
    roomEvents.forEach(roomEvent => {
        const { callbackName, eventName, piwikCode } = roomEvent;

        callbacks.add(
            callbackName,
            (room: { name: string; _id: string }) => {
                if (settings.get('Analytics_features_rooms')) {
                    room
                        ? trackEvent(
                              'Room',
                              eventName,
                              `${room.name} (${room._id})`
                          )
                        : trackEvent('Room', eventName);
                }
            },
            callbacks.priority.MEDIUM,
            piwikCode
        );
    });
};

export default addRoomTrackEvents;
