import React, { CSSProperties } from 'react';
import { areEqual } from 'react-window';

import { RoomMembers } from '../../RoomMembers';
import { RowItemData } from './RowItemData';

type Props = {
    data: RowItemData;
    index: number;
    style: CSSProperties;
};

export const MemberRow = React.memo(({ data, index, style }: Props) => {
    const { onClickView, items, rid, t, reload } = data;
    const user = items[index];

    if (!user) {
        return <RoomMembers.Option.Skeleton style={style} />;
    }

    return (
        <RoomMembers.Option
            t={t}
            style={style}
            reload={reload}
            username={user.username}
            _id={user._id}
            rid={rid}
            active={user.active}
            status={user.status}
            name={user.name}
            onClickView={onClickView}
        />
    );
}, areEqual);
