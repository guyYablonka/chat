import React from 'react';
import { RoomTypes, roomTypes } from '../../../../app/utils/client';
import { IRoom, IDirectMessageRoom, IOmnichannelRoom } from '/definition/IRoom';
import { colors } from '../../../components/UserStatus';
import { Sidebar } from '@rocket.chat/fuselage';

type Props = {
    room: IRoom | IDirectMessageRoom | IOmnichannelRoom;
    small?: boolean;
};

const isRoomGroupDM = (room: Props['room']) =>
    'uids' in room && room.uids.length > 2;
const isRoomLiveChat = (room: Props['room']): room is IOmnichannelRoom =>
    'v' in room;
const isRoomGroupOrChannel = (room: Props['room']) =>
    room.t === RoomTypes.CHANNEL || room.t === RoomTypes.PRIVATE_GROUP;

export const SidebarIcon = ({ room }: Props) => {
    if (isRoomGroupDM(room)) {
        return (
            <Sidebar.Item.Icon color='white' aria-hidden='true' name='team' />
        );
    }

    if (isRoomLiveChat(room)) {
        return (
            <Sidebar.Item.Icon
                aria-hidden='true'
                name='headset'
                color={colors[room.v.status]}
            />
        );
    }

    if (isRoomGroupOrChannel(room)) {
        return (
            <Sidebar.Item.Icon
                color='white'
                aria-hidden='true'
                name={roomTypes.getIcon(room)}
            />
        );
    }

    return null;
};

export default SidebarIcon;
