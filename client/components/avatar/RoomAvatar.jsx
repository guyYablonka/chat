import React, { memo } from 'react';
import { useRoomAvatarPath } from '../../contexts/AvatarUrlContext';
import BaseAvatar from './BaseAvatar';

function RoomAvatar({ room, url, ...rest }) {
    const getRoomPathAvatar = useRoomAvatarPath();
    const { avatarLink = getRoomPathAvatar(room), ...props } = rest;
    return <BaseAvatar rounded url={url ?? avatarLink} {...props} />;
}

export default memo(
    RoomAvatar,
    (prevProps, nextProps) =>
        prevProps.room.avatarETag === nextProps.room.avatarETag &&
        prevProps.url === nextProps.url
);
