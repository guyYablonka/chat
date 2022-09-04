import React, { useState } from 'react';
import { Option, Box, Tag } from '@rocket.chat/fuselage';
import { Menu } from '../../../../../../components/Menu/Menu';
import { usePrefersReducedMotion } from '@rocket.chat/fuselage-hooks';

import {
    useUserHasRoomRole,
    useUserInfoActions,
    useUserInfoActionsSpread
} from '../../../../hooks/useUserInfoActions';
import UserAvatar from '../../../../../../components/avatar/UserAvatar';
import { ReactiveUserStatus } from '../../../../../../components/UserStatus';
import { usePreventProgation } from '../hooks/usePreventProgation';
import { useSetting } from '/client/contexts/SettingsContext';

const UserActions = ({ username, _id, rid, reload }) => {
    const { menu: menuOptions } = useUserInfoActionsSpread(
        useUserInfoActions({ _id, username }, rid, reload),
        0
    );

    if (!menuOptions) {
        return null;
    }

    return (
        <Menu
            flexShrink={0}
            key='menu'
            tiny
            renderItem={({ label: { label, icon }, ...props }) => (
                <Option {...props} label={label} icon={icon} />
            )}
            options={menuOptions}
        />
    );
};

export const MemberItem = ({
    _id,
    status,
    active,
    name,
    username,
    onClickView,
    style,
    rid,
    t,
    reload
}) => {
    const [showButton, setShowButton] = useState();
    const isOwner = useUserHasRoomRole(_id, rid, 'owner');
    const showStatus = useSetting('Accounts_ShowPresenceStatus');
    const isReduceMotionEnabled = usePrefersReducedMotion();
    const handleMenuEvent = {
        [isReduceMotionEnabled ? 'onMouseEnter' : 'onTransitionEnd']:
            setShowButton
    };

    const onClick = usePreventProgation();

    return (
        <Option
            id={_id}
            style={style}
            data-username={username}
            presence={status}
            onClick={onClickView}
            {...handleMenuEvent}
        >
            <Option.Avatar>
                <UserAvatar username={username} size='x28' />
            </Option.Avatar>
            {showStatus && (
                <Option.Column>
                    <ReactiveUserStatus uid={_id} presence={status} />
                </Option.Column>
            )}
            <Option.Content>
                {name} <Option.Description>({username})</Option.Description>
            </Option.Content>
            {isOwner && (
                <Box>
                    <Tag small disabled>
                        {t('Owner')}
                    </Tag>
                </Box>
            )}
            {!active && (
                <Box>
                    <Tag small disabled>
                        {t('Deactivated')}
                    </Tag>
                </Box>
            )}
            <Box onClick={onClick}>
                <UserActions
                    username={username}
                    rid={rid}
                    _id={_id}
                    reload={reload}
                />
            </Box>
        </Option>
    );
};

MemberItem.Skeleton = Option.Skeleton;
