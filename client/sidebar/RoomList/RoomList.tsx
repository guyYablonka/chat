import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import memoize from 'memoize-one';
import { useResizeObserver } from '@rocket.chat/fuselage-hooks';
import { Box } from '@rocket.chat/fuselage';
import { IRoom } from '/definition/IRoom';
import {
    useTranslation,
    TranslationContextValue
} from '../../contexts/TranslationContext';
import { useUserPreference, useUserId } from '../../contexts/UserContext';
import { useSession } from '../../contexts/SessionContext';
import { useTemplateByViewMode } from '../hooks/useTemplateByViewMode';
import { useAvatarTemplate } from '../hooks/useAvatarTemplate';
import { useRoomList } from '../hooks/useRoomList';
import { usePreventDefault } from '../hooks/usePreventDefault';
import { useSidebarPaletteColor } from '../hooks/useSidebarPaletteColor';
import { itemSizeMap } from './functions/itemSizeMap';
import { RoomRow } from './RoomRow/RoomRow';
import ScrollerWithCustomProps from '/client/components/ScrollerWithCustomProps';
import { Extended } from '../Item';

export type ItemData = {
    extended: boolean;
    t: TranslationContextValue['translate'];
    SideBarItemTemplate: typeof Extended;
    AvatarTemplate: ((room: IRoom) => JSX.Element) | null;
    isAnonymous: boolean;
    sidebarViewMode: 'medium' | 'extended' | 'condensed';
    openedRoom?: string;
};

export const createItemData = memoize(
    (
        extended: ItemData['extended'],
        t: TranslationContextValue['translate'],
        SideBarItemTemplate: ItemData['SideBarItemTemplate'],
        AvatarTemplate: ItemData['AvatarTemplate'],
        openedRoom: ItemData['openedRoom'],
        sidebarViewMode: ItemData['sidebarViewMode'],
        isAnonymous: ItemData['isAnonymous']
    ) => ({
        extended,
        t,
        SideBarItemTemplate,
        AvatarTemplate,
        openedRoom,
        sidebarViewMode,
        isAnonymous
    })
);

export default () => {
    useSidebarPaletteColor();

    const openedRoom = useSession('openedRoom') as string | undefined;

    const sidebarViewMode = useUserPreference(
        'sidebarViewMode'
    ) as ItemData['sidebarViewMode'];
    const sideBarItemTemplate = useTemplateByViewMode();
    const avatarTemplate = useAvatarTemplate();
    const extended = sidebarViewMode === 'extended';
    const isAnonymous = !useUserId();
    const { ref } = useResizeObserver({ debounceDelay: 100 });

    const t = useTranslation();

    const itemHeight = itemSizeMap(sidebarViewMode);
    const roomsList = useRoomList();
    const itemData = createItemData(
        extended,
        t,
        sideBarItemTemplate,
        avatarTemplate,
        openedRoom,
        sidebarViewMode,
        isAnonymous
    );

    usePreventDefault(ref);

    const renderEmpty = () => (
        <div className='no-conversations-msg'>{t('No_Conversations')}</div>
    );

    return (
        <Box h='full' w='full' ref={ref}>
            <Virtuoso
                totalCount={roomsList.length}
                data={roomsList}
                components={{
                    Scroller: ScrollerWithCustomProps,
                    EmptyPlaceholder: renderEmpty
                }}
                itemContent={(_index, item) => (
                    <RoomRow
                        key={item.rid ?? item}
                        item={item}
                        itemData={itemData}
                        itemHeight={itemHeight}
                    />
                )}
            />
        </Box>
    );
};
