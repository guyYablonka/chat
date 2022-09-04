import React from 'react';
import { Sidebar } from '@rocket.chat/fuselage';
import { ISubscription } from '/definition/ISubscription';
import Omnichannel from '../../sections/Omnichannel';
import { ItemData } from '../RoomList';
import { SideBarItemTemplateWithData } from '../../Item';
import { _ } from 'meteor/underscore';

type Props = {
    index?: number;
    item: ISubscription | string;
    itemData: ItemData;
    itemHeight?: number;
    [x: string]: unknown;
};

const sections = {
    Omnichannel
};

export const RoomRow = ({ item, itemData, itemHeight, ...props }: Props) => {
    const {
        extended,
        t,
        SideBarItemTemplate,
        AvatarTemplate,
        openedRoom,
        sidebarViewMode,
        isAnonymous
    } = itemData;
    if (typeof item === 'string') {
        const Section =
            item === 'Omnichannel' && sections[item as keyof typeof sections];
        return Section ? (
            <Section aria-level='1' {...props} />
        ) : (
            <Sidebar.Section.Title {...props} aria-level='1'>
                {t(item)}
            </Sidebar.Section.Title>
        );
    }

    return (
        <SideBarItemTemplateWithData
            id={item._id ?? item}
            isAnonymous={isAnonymous}
            height={itemHeight}
            sidebarViewMode={sidebarViewMode}
            selected={item.rid === openedRoom}
            t={t}
            room={item}
            extended={extended}
            SideBarItemTemplate={SideBarItemTemplate}
            AvatarTemplate={AvatarTemplate}
            fullName={item.directDisplayName}
            {...props}
        />
    );
};
