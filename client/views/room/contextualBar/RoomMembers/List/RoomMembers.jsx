import React, { useEffect } from 'react';

import {
    Box,
    Icon,
    TextInput,
    Throbber,
    ButtonGroup,
    Button,
    Callout,
    Divider
} from '@rocket.chat/fuselage';
import { Virtuoso } from 'react-virtuoso';

import { useTranslation } from '../../../../../contexts/TranslationContext';
import VerticalBar from '../../../../../components/VerticalBar';
import VirtuosoScroller from '../../../../../components/VirtuosoScroller';
import { MemberItem } from './components/MemberItem';
import { createMemberItemData } from './components/MemberRow/RowItemData';
import { MemberRow } from './components/MemberRow/MemberRow';
import { MembersPagination } from './components/MembersPagination/MemberPagination';

export const RoomMembers = ({
    loading,
    members = [],
    text,
    setText,
    onClickClose,
    onClickView,
    onClickAdd,
    onClickInvite,
    total,
    error,
    reload,
    rid,
    current,
    setCurrent,
    maxMembersPerPage
}) => {
    const t = useTranslation();
    const itemData = createMemberItemData(members, onClickView, rid, t, reload);
    const isShowButtons = onClickInvite || onClickAdd;
    const isShowPagination = total > maxMembersPerPage;
    const isShowFooter = isShowButtons || isShowPagination;

    useEffect(() => {
        if (current >= total) {
            setCurrent(curr => curr - maxMembersPerPage);
        }
    }, [current, maxMembersPerPage, setCurrent, total]);

    const usersResult = () => {
        if (total <= maxMembersPerPage) {
            return t(
                text ? 'Showing_results' : 'Showing_users',
                members.length
            );
        }
        if (total > maxMembersPerPage) {
            return t(
                text ? 'Showing_results_from' : 'Showing_users_from',
                members.length,
                total
            );
        }
    };

    return (
        <>
            <VerticalBar.Header>
                <VerticalBar.Icon name='team' />
                <VerticalBar.Text>{t('Members_List')}</VerticalBar.Text>
                {onClickClose && <VerticalBar.Close onClick={onClickClose} />}
            </VerticalBar.Header>

            <VerticalBar.Content p='x12'>
                <Box display='flex' flexDirection='row' p='x12' flexShrink={0}>
                    <Box
                        display='flex'
                        flexDirection='row'
                        flexGrow={1}
                        mi='neg-x4'
                    >
                        <TextInput
                            placeholder={t('Search_Users')}
                            value={text}
                            onChange={setText}
                            addon={<Icon name='magnifier' size='x20' />}
                        />
                    </Box>
                </Box>

                {!loading && !!members.length && (
                    <Box p='x12'>{usersResult()}</Box>
                )}

                {error && (
                    <Box pi='x24' pb='x12'>
                        <Callout type='danger'>{error}</Callout>
                    </Box>
                )}

                {loading && (
                    <Box pi='x24' pb='x12'>
                        <Throbber size='x12' />
                    </Box>
                )}
                {!loading && !members.length && (
                    <Box pi='x24' pb='x12'>
                        {t('No_results_found')}
                    </Box>
                )}

                <Divider />

                <Box w='full' h='full' overflow='hidden' flexShrink={1}>
                    {!loading && members && members.length > 0 && (
                        <Virtuoso
                            style={{
                                height: '100%',
                                width: '100%'
                            }}
                            totalCount={total}
                            overscan={25}
                            data={members}
                            components={{ Scroller: VirtuosoScroller }}
                            itemContent={(index, data) => (
                                <MemberRow
                                    data={itemData}
                                    user={data}
                                    index={index}
                                />
                            )}
                        />
                    )}
                </Box>
            </VerticalBar.Content>

            {isShowFooter && (
                <VerticalBar.Footer>
                    {isShowPagination && (
                        <MembersPagination
                            count={total}
                            current={current}
                            itemsPerPage={maxMembersPerPage}
                            onSetCurrent={setCurrent}
                            fontSize={isShowButtons ? '16px' : '20px'}
                            padding={0}
                        />
                    )}
                    {isShowButtons && (
                        <ButtonGroup vertical>
                            {onClickInvite && (
                                <Button onClick={onClickInvite}>
                                    <Box is='span' mie='x4'>
                                        <Icon name='link' size='x20' />
                                    </Box>
                                    {t('Invite_Link')}
                                </Button>
                            )}
                            {onClickAdd && (
                                <Button onClick={onClickAdd} primary>
                                    <Box is='span' mie='x4'>
                                        <Icon name='user-plus' size='x20' />
                                    </Box>
                                    {t('Invite_Users')}
                                </Button>
                            )}
                        </ButtonGroup>
                    )}
                </VerticalBar.Footer>
            )}
        </>
    );
};

RoomMembers.Option = MemberItem;
