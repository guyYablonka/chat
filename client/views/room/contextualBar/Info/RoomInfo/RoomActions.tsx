import { useRoute, useCurrentRoute } from '/client/contexts/RouterContext';
import React from 'react';
import { Action } from '../../UserInfo';
import { useTranslation } from '/client/contexts/TranslationContext';
import FilesList from '../FilesList/FilesList';
import { useSetting } from '/client/contexts/SettingsContext';
import { modal } from '/app/ui-utils/client';
import { callbacks } from '/app/callbacks/client';
import { RoomTypes } from '/app/utils/client';

type RoomActionProps = {
    rid: string;
    roomType: string;
};

export const RoomActions = ({ rid, roomType, ...props }: RoomActionProps) => {
    const [routeName, params] = useCurrentRoute();
    const route = useRoute(routeName ?? '');
    const t = useTranslation();
    const isPinningEnabled = useSetting('Message_AllowPinning');
    const isSharedGroupsEnabled = useSetting('Show_Shared_Groups_Button');
    const sharedGroupsModalContent = useSetting('Shared_Groups_Modal_Content');
    const onActionClick = (tab: string) => route.push({ ...params, tab });
    const actions = [
        {
            title: 'Starred_Messages',
            icon: 'star',
            onClick: () => onActionClick('starred-messages')
        }
    ];

    const openSharedGroupsModal = () => {
        modal.open({
            title: t('Shared_Groups_Test_Modal_Header'),
            text: sharedGroupsModalContent,
            confirmButtonText: t('Shared_Groups_Test_Modal_Confirm'),
            showCancelButton: false,
            showCloseButton: false,
            html: true
        });
        callbacks.run('userClickedOn-shared-groups');
    };

    if (isPinningEnabled) {
        actions.push({
            title: 'Pinned Messages',
            icon: 'pin',
            onClick: () => onActionClick('pinned-messages')
        });
    }

    if (roomType !== 'd') {
        actions.push({
            title: 'Mentions',
            icon: 'at',
            onClick: () => onActionClick('mentions')
        });
    }

    if (roomType === RoomTypes.DM && isSharedGroupsEnabled) {
        actions.push({
            title: t('Shared_Groups'),
            icon: 'team',
            onClick: () => openSharedGroupsModal()
        });
    }

    return (
        <>
            <FilesList
                rid={rid}
                roomType={roomType}
                onTitleClick={onActionClick}
                {...props}
            />

            {actions.map(({ title, icon, onClick }) => (
                <Action
                    chevron
                    key={title}
                    title={t(title)}
                    label={t(title)}
                    onClick={onClick}
                    icon={icon}
                />
            ))}
        </>
    );
};
