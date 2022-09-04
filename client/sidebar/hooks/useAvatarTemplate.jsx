import React, { useMemo } from 'react';
import { isNumber } from 'underscore';

import RoomAvatar from '../../components/avatar/RoomAvatar';
import { useUserPreference } from '../../contexts/UserContext';
import { getAvatarURL } from '/app/utils/lib/getAvatarURL';

export const useAvatarTemplate = () => {
    const sidebarViewMode = useUserPreference('sidebarViewMode');
    const sidebarHideAvatar = useUserPreference('sidebarHideAvatar');
    return useMemo(() => {
        if (sidebarHideAvatar) {
            return null;
        }

        const size = (() => {
            switch (sidebarViewMode) {
                case 'extended':
                    return 'x36';
                case 'medium':
                    return 'x28';
                case 'condensed':
                default:
                    return 'x16';
            }
        })();

        return room => (
            <RoomAvatar
                size={size}
                room={{ ...room, _id: room.rid || room._id, type: room.t }}
                {...(isNumber(room.avatarETag) && {
                    url: getAvatarURL({ username: `@${room.name}` })
                })}
            />
        );
    }, [sidebarHideAvatar, sidebarViewMode]);
};
