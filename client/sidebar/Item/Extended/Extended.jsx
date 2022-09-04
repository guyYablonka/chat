import React, { Fragment, useState } from 'react';
import { Sidebar, ActionButton, Divider, Box } from '@rocket.chat/fuselage';
import {
    useMutableCallback,
    usePrefersReducedMotion
} from '@rocket.chat/fuselage-hooks';
import { useShortTimeAgo } from '../../../hooks/useTimeAgo';
import './item.css';

const Extended = React.memo(
    ({
        icon,
        title = '',
        avatar,
        actions,
        href,
        time,
        menu,
        menuOptions,
        subtitle = '',
        badges,
        indicators,
        threadUnread,
        unread,
        selected,
        fullName,
        ...props
    }) => {
        const formatDate = useShortTimeAgo();
        const [menuVisibility, setMenuVisibility] = useState(
            !!window.DISABLE_ANIMATION
        );

        const isReduceMotionEnabled = usePrefersReducedMotion();

        const handleMenu = useMutableCallback(e => {
            setMenuVisibility(e.target.offsetWidth > 0 && Boolean(menu));
        });

        const handleMenuEvent = {
            [isReduceMotionEnabled ? 'onMouseEnter' : 'onTransitionEnd']:
                handleMenu
        };

        return (
            <Sidebar.Item
                aria-selected={selected}
                selected={selected}
                highlighted={unread}
                {...props}
                title={title}
                href={href}
                clickable={!!href}
            >
                {avatar && (
                    <Sidebar.Item.Avatar size='x36'>
                        {avatar}
                    </Sidebar.Item.Avatar>
                )}
                <Sidebar.Item.Content>
                    <Sidebar.Item.Wrapper>
                        {icon}
                        <Sidebar.Item.Title
                            data-qa='sidebar-item-title'
                            className='rcx-sidebar-item--highlighted'
                        >
                            {fullName || title}
                        </Sidebar.Item.Title>
                        {time && (
                            <Sidebar.Item.Time className='sidebar-time-style'>
                                {formatDate(time)}
                            </Sidebar.Item.Time>
                        )}
                    </Sidebar.Item.Wrapper>
                    <Sidebar.Item.Wrapper className='sidebar-wrapper-spacing'>
                        <Sidebar.Item.Subtitle
                            tabIndex='-1'
                            className={
                                unread && 'rcx-sidebar-item--highlighted'
                            }
                        >
                            {subtitle}
                        </Sidebar.Item.Subtitle>
                        {indicators?.map((indicator, index) => (
                            <Fragment key={index}>{indicator}</Fragment>
                        ))}
                        <Sidebar.Item.Badge>{badges}</Sidebar.Item.Badge>
                        {menu && (
                            <Sidebar.Item.Menu {...handleMenuEvent}>
                                {menuVisibility ? (
                                    menu()
                                ) : (
                                    <ActionButton
                                        square
                                        ghost
                                        mini
                                        rcx-sidebar-item__menu
                                        icon='kebab'
                                    />
                                )}
                            </Sidebar.Item.Menu>
                        )}
                    </Sidebar.Item.Wrapper>
                </Sidebar.Item.Content>
                {actions && (
                    <Sidebar.Item.Container>
                        {<Sidebar.Item.Actions>{actions}</Sidebar.Item.Actions>}
                    </Sidebar.Item.Container>
                )}
            </Sidebar.Item>
        );
    }
);

export default Extended;
