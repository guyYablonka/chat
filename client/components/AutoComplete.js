import React, { useMemo, useState } from 'react';
import { AutoComplete, Option, Options, Box } from '@rocket.chat/fuselage';

import UserAvatar from './avatar/UserAvatar';
import { useEndpointData } from '../hooks/useEndpointData';

const query = (term = '', conditions, exceptions) => ({
	selector: JSON.stringify({ term, conditions, exceptions })
});

const Avatar = ({ value, ...props }) => (
	<UserAvatar
		style={{ marginInlineEnd: '0.25rem' }}
		size={Options.AvatarSize}
		username={value}
		{...props}
	/>
);

export const UserAutoComplete = React.memo(
	({ conditions, exceptions, ...props }) => {
		const [filter, setFilter] = useState('');
		const { value: data } = useEndpointData(
			'users.autocomplete',
			useMemo(() => query(filter, conditions, exceptions), [filter])
		);
		const options = useMemo(
			() =>
				(data &&
					data.items.map(user => ({
						value: user.username,
						label: user.name
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
					<Box
						is="span"
						margin="none"
						mis="x4"
						style={{
							whiteSpace: 'pre-wrap',
							wordBreak: 'break-word'
						}}
					>
						<Avatar value={value} />
						{label}
					</Box>
				)}
				renderItem={({ value, label, ...props }) => (
					<Option value={value} {...props}>
						<Box is="span">
							<Avatar value={value} />
							{`${label} (${value})`}
						</Box>
					</Option>
				)}
				options={options}
			/>
		);
	}
);
