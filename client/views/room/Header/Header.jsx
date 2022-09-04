import React, { useMemo } from 'react';
import { ActionButton } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { isNumber } from 'underscore';
import RoomAvatar from '../../../components/avatar/RoomAvatar';
import Header from '../../../components/Header';
import MarkdownText from '../../../components/MarkdownText';
import { useLayout } from '../../../contexts/LayoutContext';
import { useTranslation } from '../../../contexts/TranslationContext';
import { useRoomIcon } from '../../../hooks/useRoomIcon';
import Burger from './Burger';
import Encrypted from './icons/Encrypted';
import Translate from './icons/Translate';
import ToolBox from './ToolBox';
import { getAvatarURL } from '/app/utils/lib/getAvatarURL';

export default React.memo(({ room }) => {
    const { isEmbedded, showTopNavbarEmbeddedLayout } = useLayout();
    if (isEmbedded && !showTopNavbarEmbeddedLayout) {
        return null;
    }
    return <RoomHeader room={room} />;
});

const BackToRoom = React.memo(({ small, prid }) => {
    const t = useTranslation();
    const onClick = useMutableCallback(() => {
        FlowRouter.goToRoomById(prid);
    });
    return (
        <ActionButton
            mie='x4'
            icon='back'
            ghost
            small={small}
            title={t('Back_to_room')}
            onClick={onClick}
        />
    );
});

const RoomHeader = ({ room }) => {
    const icon = useRoomIcon(room);
    const { isMobile } = useLayout();

    const url = useMemo(
        () => getAvatarURL({ username: `@${room.name}` }),
        [room.name]
    );

    const avatar = (
        <RoomAvatar
            room={room}
            {...(isNumber(room.avatarETag) && {
                url
            })}
        />
    );
    return (
        <Header>
            {(isMobile || room.prid) && (
                <Header.ToolBox>
                    {isMobile && <Burger />}
                    {room.prid && (
                        <BackToRoom small={!isMobile} prid={room.prid} />
                    )}
                </Header.ToolBox>
            )}
            {avatar && <Header.Avatar>{avatar}</Header.Avatar>}
            <Header.Content>
                <Header.Content.Row>
                    {icon && <Header.Icon icon={icon} />}
                    <Header.Title>{room.name}</Header.Title>
                    <Encrypted room={room} />
                    <Translate room={room} />
                </Header.Content.Row>
                <Header.Content.Row>
                    <Header.Subtitle>
                        {room.topic && (
                            <MarkdownText
                                withRichContent={false}
                                content={room.topic}
                            />
                        )}
                    </Header.Subtitle>
                </Header.Content.Row>
            </Header.Content>
            <Header.ToolBox>
                <ToolBox room={room} />
            </Header.ToolBox>
        </Header>
    );
};
