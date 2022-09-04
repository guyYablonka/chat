import { Badge, Icon } from '@rocket.chat/fuselage';
import React from 'react';
import { emojiParser } from '../../../../app/emoji/client/emojiParser';
import { roomTypes, RoomTypes } from '../../../../app/utils';
import SidebarIcon from '../../RoomList/SidebarIcon/SidebarIcon';
import RoomMenu from '../../RoomMenu';
import { filterMarkdown } from '/app/markdown/lib/markdown';
import { escapeHTML } from '/lib/escapeHTML';

const normalizeSidebarMessage = (message, t) => {
    if (message.msg) {
        const adjustedText = escapeHTML(filterMarkdown(message.msg));
        return emojiParser({ html: adjustedText }).html;
    }

    if (message.attachments) {
        const attachment = message.attachments.find(
            attachment => attachment.title || attachment.description
        );

        if (attachment && attachment.description) {
            return escapeHTML(attachment.description);
        }

        if (attachment && attachment.title) {
            return escapeHTML(attachment.title);
        }

        return t('Sent_an_attachment');
    }
};
const getMessage = (room, lastMessage, t) => {
    if (!lastMessage) {
        return t('No_messages_yet');
    }
    if (!lastMessage.u) {
        return normalizeSidebarMessage(lastMessage, t);
    }
    if (lastMessage.u?.username === room.u?.username) {
        return `${t('You')}: ${normalizeSidebarMessage(lastMessage, t)}`;
    }
    if (room.t === RoomTypes.DM && room.uids && room.uids.length <= 2) {
        return normalizeSidebarMessage(lastMessage, t);
    }
    return `${
        lastMessage.u.name || lastMessage.u.username
    }: ${normalizeSidebarMessage(lastMessage, t)}`;
};

export const SideBarItemTemplateWithData = React.memo(
    function SideBarItemTemplateWithData({
        room,
        id,
        extended,
        selected,
        SideBarItemTemplate,
        AvatarTemplate,
        t,
        height,
        style,
        fullName,
        sidebarViewMode,
        isAnonymous,
        ...props
    }) {
        const title = roomTypes.getRoomName(room.t, room);
        const icon = (
            <SidebarIcon room={room} small={!!(sidebarViewMode !== 'medium')} />
        );
        const href = roomTypes.getRouteLink(room.t, room);

        const {
            lastMessage,
            hideUnreadStatus,
            unread = 0,
            alert,
            lm,
            userMentions,
            groupMentions,
            tunread = [],
            tunreadUser = [],
            rid,
            t: type,
            cl,
            disableNotifications,
            f: favorite
        } = room;

        const isQueued = room.status === 'queued';

        const threadUnread = tunread.length > 0;
        const message = extended && getMessage(room, lastMessage, t);

        const subtitle = message ? (
            <span
                className='message-body--unstyled'
                dangerouslySetInnerHTML={{ __html: message }}
            />
        ) : null;
        const variant =
            ((userMentions || tunreadUser.length) && 'danger') ||
            (threadUnread && 'primary') ||
            (groupMentions && 'warning') ||
            'ghost';

        const badgesStyle = {
            flexShrink: 0,
            color: alert && unread === 0 ? 'var(--color-blue)' : ''
        };
        let badges =
            (unread >= 0 || threadUnread) && alert ? (
                <Badge style={badgesStyle} variant={variant}>
                    {unread + tunread?.length}{' '}
                </Badge>
            ) : null;

        const indicatorMute = disableNotifications ? (
            <Icon size={16} name='volume-off' />
        ) : null;

        const indicatorFavorite = favorite ? (
            <Icon
                size={16}
                name='pin'
                style={{
                    transform: 'rotate(90deg)'
                }}
            />
        ) : null;

        return (
            <SideBarItemTemplate
                {...props}
                is='a'
                id={id}
                style={height ? { height } : style}
                data-qa='sidebar-item'
                aria-level='2'
                unread={!hideUnreadStatus && (alert || unread)}
                threadUnread={threadUnread}
                selected={selected}
                href={href}
                aria-label={title}
                title={title}
                fullName={fullName ?? room.fullName}
                time={lm}
                subtitle={subtitle}
                icon={icon}
                badges={badges}
                indicators={[indicatorMute, indicatorFavorite]}
                avatar={AvatarTemplate && <AvatarTemplate {...room} />}
                menu={
                    !isAnonymous &&
                    !isQueued &&
                    (() => (
                        <RoomMenu
                            alert={alert}
                            threadUnread={threadUnread}
                            rid={rid}
                            unread={!!unread}
                            roomOpen={false}
                            type={type}
                            cl={cl}
                            name={title}
                            status={room.status}
                        />
                    ))
                }
            />
        );
    },
    (prevProps, nextProps) => {
        if (
            [
                'id',
                'style',
                'extended',
                'selected',
                'SideBarItemTemplate',
                'AvatarTemplate',
                't',
                'sidebarViewMode',
                'fullName'
            ].some(key => prevProps[key] !== nextProps[key])
        ) {
            return false;
        }

        if (prevProps.room === nextProps.room) {
            return true;
        }

        if (prevProps.room._id !== nextProps.room._id) {
            return false;
        }

        if (prevProps.room.avatarETag !== nextProps.room.avatarETag) {
            return false;
        }

        if (
            prevProps.room._updatedAt?.toISOString() !==
            nextProps.room._updatedAt?.toISOString()
        ) {
            return false;
        }
        if (
            prevProps.room.lm?.toISOString?.() !==
            nextProps.room.lm?.toISOString?.()
        ) {
            return false;
        }
        if (
            prevProps.room.lastMessage?._updatedAt?.toISOString() !==
            nextProps.room.lastMessage?._updatedAt?.toISOString()
        ) {
            return false;
        }
        if (prevProps.room.alert !== nextProps.room.alert) {
            return false;
        }
        if (prevProps.room.v?.status !== nextProps.room.v?.status) {
            return false;
        }

        return true;
    }
);
export default SideBarItemTemplateWithData;
