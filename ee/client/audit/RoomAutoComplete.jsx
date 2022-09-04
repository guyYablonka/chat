import { AutoComplete, Option, Options } from '@rocket.chat/fuselage';
import React, { useMemo, useState } from 'react';
import RoomAvatar from '../../../client/components/avatar/RoomAvatar';
import { useEndpointData } from '../../../client/hooks/useEndpointData';
import { getAvatarURL } from '/app/utils/lib/getAvatarURL';

const query = (name = '') => ({ selector: JSON.stringify({ name }) });

const Avatar = ({ value, type, avatarETag, name, ...props }) => {
    const url = useMemo(() => getAvatarURL({ username: `@${name}` }), [name]);
    return (
        <RoomAvatar
            size={Options.AvatarSize}
            room={{ type, _id: value, avatarETag }}
            {...props}
        />
    );
};

const RoomAutoComplete = React.memo(props => {
    const [filter, setFilter] = useState('');
    const { value: data } = useEndpointData(
        'rooms.autocomplete.channelAndPrivate',
        useMemo(() => query(filter), [filter])
    );
    const options = useMemo(
        () =>
            (data &&
                data.items.map(({ name, _id, fname, avatarETag, t }) => ({
                    value: _id,
                    label: { name: fname || name, avatarETag, type: t }
                }))) ||
            [],
        [data]
    );

    return (
        <AutoComplete
            {...props}
            filter={filter}
            setFilter={setFilter}
            renderSelected={({ value, label }) => (
                <Option
                    label={label.name}
                    avatar={
                        <Avatar value={value} room={{ _id: value, ...label }} />
                    }
                />
            )}
            renderItem={({ value, label, ...props }) => (
                <Option
                    key={value}
                    {...props}
                    label={label.name}
                    avatar={<Avatar value={value} {...label} />}
                />
            )}
            options={options}
        />
    );
});

export default RoomAutoComplete;
