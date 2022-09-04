import { useMemo, lazy } from 'react';

import {
    usePermission,
    useAtLeastOnePermission
} from '../../../../contexts/AuthorizationContext';

import { addAction } from '.';

addAction('rocket-search', {
    groups: ['channel', 'group', 'direct', 'direct_multiple', 'live'],
    id: 'rocket-search',
    title: 'Search_Messages',
    icon: 'magnifier',
    template: 'RocketSearch',
    order: 1
});

addAction('user-info', {
    groups: ['direct'],
    id: 'user-info',
    title: 'User_Info',
    icon: 'user',
    template: lazy(() => import('../../MemberListRouter')),
    order: 2
});

addAction('user-info-group', {
    groups: ['direct_multiple'],
    id: 'user-info-group',
    title: 'Members_List',
    icon: 'team',
    template: lazy(() => import('../../MemberListRouter')),
    order: 2
});

addAction('members-list', ({ room }) => {
    const hasPermission = usePermission('view-broadcast-member-list', room._id);
    return useMemo(
        () =>
            !room.broadcast || hasPermission
                ? {
                      groups: ['channel', 'group'],
                      id: 'members-list',
                      title: 'Members_List',
                      icon: 'team',
                      template: lazy(() => import('../../MemberListRouter')),
                      order: 2
                  }
                : null,
        [hasPermission, room.broadcast]
    );
});

addAction('add-members', ({ room }) => {
    const hasPermission = useAtLeastOnePermission(
        useMemo(
            () => [
                room.t === 'p'
                    ? 'add-user-to-any-p-room'
                    : 'add-user-to-any-c-room',
                'add-user-to-joined-room'
            ],
            [room.t]
        ),
        room._id
    );
    return useMemo(
        () =>
            hasPermission
                ? {
                      groups: ['channel', 'group', 'direct_multiple'],
                      id: 'add-members',
                      title: 'Invite_Users',
                      icon: 'user-plus',
                      template: lazy(
                          () =>
                              import('../../contextualBar/RoomMembers/AddUsers')
                      ),
                      order: 3
                  }
                : null,
        [hasPermission]
    );
});

addAction('uploaded-files-list', {
    groups: ['channel', 'group', 'direct', 'direct_multiple', 'live'],
    id: 'uploaded-files-list',
    title: 'Files_List',
    icon: 'clip',
    template: lazy(() => import('../../contextualBar/RoomFiles')),
    order: 4
});
