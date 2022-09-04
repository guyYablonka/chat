import React, { useCallback, useMemo, useState } from 'react';

import {
    useMutableCallback,
    useDebouncedValue
} from '@rocket.chat/fuselage-hooks';

import { AsyncStatePhase } from '../../../../../../hooks/useAsyncState';
import { useUserRoom } from '../../../../../../contexts/UserContext';
import { useAtLeastOnePermission } from '../../../../../../contexts/AuthorizationContext';
import { useGetUsersOfRoom } from '../hooks/useGetUsersOfRoom';
import { callbacks } from '../../../../../../../app/callbacks/client';
import UserInfoWithData from '../../../UserInfo';
import InviteUsers from '../../InviteUsers/InviteUsers';
import AddUsers from '../../AddUsers/AddUsers';
import { useTabBarClose } from '../../../../providers/ToolboxProvider';
import { RoomMembers } from '../RoomMembers';

const MAX_MEMBERS_PER_PAGE = 50;

export const RoomMembersWithData = ({ rid }) => {
    const [current, setCurrent] = useState(0);
    const [state, setState] = useState({});
    const onClickClose = useTabBarClose();
    const room = useUserRoom(rid);
    room.type = room.t;
    room.rid = rid;

    const [text, setText] = useState('');

    const debouncedText = useDebouncedValue(text, 500);

    const params = useMemo(
        () => [
            rid,
            debouncedText,
            true,
            { limit: MAX_MEMBERS_PER_PAGE, skip: current }
        ],
        [rid, current, debouncedText]
    );

    const { value, phase, error, reload } = useGetUsersOfRoom(params);

    const canAddUsers = useAtLeastOnePermission(
        useMemo(
            () => [
                room.t === 'p'
                    ? 'add-user-to-any-p-room'
                    : 'add-user-to-any-c-room',
                'add-user-to-joined-room'
            ],
            [room.t]
        ),
        rid
    );

    const handleTextChange = useCallback(event => {
        setCurrent(0);
        setText(event.currentTarget.value);
    }, []);

    const viewUser = useMutableCallback(e => {
        const { username } = e.currentTarget.dataset;
        setState({
            tab: 'UserInfo',
            username
        });
    });

    const addUser = useMutableCallback(() => {
        setState({ tab: 'AddUsers' });
        callbacks.run('userClickToAddMembersFromMembersList');
    });

    const handleBack = useCallback(() => setState({}), [setState]);

    if (state.tab === 'UserInfo') {
        return (
            <UserInfoWithData
                rid={rid}
                onClickClose={onClickClose}
                onClickBack={handleBack}
                username={state.username}
            />
        );
    }

    if (state.tab === 'InviteUsers') {
        return (
            <InviteUsers
                onClickClose={onClickClose}
                rid={rid}
                onClickBack={handleBack}
            />
        );
    }

    if (state.tab === 'AddUsers') {
        return (
            <AddUsers
                onClickClose={onClickClose}
                rid={rid}
                reload={reload}
                onClickBack={handleBack}
            />
        );
    }

    return (
        <RoomMembers
            rid={rid}
            loading={phase === AsyncStatePhase.LOADING}
            text={text}
            error={error}
            setText={handleTextChange}
            members={value?.records}
            total={value?.total}
            onClickClose={onClickClose}
            onClickView={viewUser}
            onClickAdd={canAddUsers && addUser}
            reload={reload}
            current={current}
            setCurrent={setCurrent}
            maxMembersPerPage={MAX_MEMBERS_PER_PAGE}
        />
    );
};
