import React, { useMemo, useState, useEffect } from 'react';
import { Box, Option, Options, Chip } from '@rocket.chat/fuselage';
import {
	useMutableCallback,
	useDebouncedValue
} from '@rocket.chat/fuselage-hooks';

import UserAvatar from '../../../client/components/avatar/UserAvatar';
import { useEndpointData } from '../../../client/hooks/useEndpointData';
import AutoCompleteMultiple from '/client/components/AutoComplete/AutoCompleteMutliple';

const query = (term = '', conditions, exceptions) => ({
	selector: JSON.stringify({ term, conditions, exceptions })
});

const Avatar = ({ value, ...props }) => (
	<UserAvatar size={Options.AvatarSize} username={value} {...props} />
);

const UserAutoCompleteMultiple = React.memo(
	({ conditions, exceptions, ...props }) => {
		const [filter, setFilter] = useState('');
		const debouncedFilter = useDebouncedValue(filter, 300);
		const { value: data } = useEndpointData(
			'users.autocomplete',
			useMemo(
				() => query(debouncedFilter, conditions, exceptions),
				[debouncedFilter, conditions, exceptions]
			)
		);

		const options = useMemo(
			() =>
				(data &&
					data.items.map(user => ({
						value: user.name + '$~^%' + user.username,
						label: [
							`${user.name} (${user.username})`,
							user.username
						]
					}))) ||
				[],
			[data]
		);

		const onClickRemove = useMutableCallback(e => {
			e.stopPropagation();
			e.preventDefault();
			props.onChange(e.currentTarget.value, 'remove');
		});

		return (
			<AutoCompleteMultiple
				{...props}
				filter={filter}
				setFilter={setFilter}
				renderSelected={({ value: selected }) =>
					selected.map(value => {
						const [name, username] = value.split('$~^%');

						return (
							<Chip
								key={username}
								value={username}
								onClick={onClickRemove}
								mie="x4"
								mbe="x4"
							>
								<UserAvatar size="x20" username={username} />
								<Box
									is="span"
									margin="none"
									mis="x4"
									style={{
										whiteSpace: 'pre-wrap',
										wordBreak: 'break-word'
									}}
								>
									{name}
								</Box>
							</Chip>
						);
					})
				}
				renderItem={({
					value,
					label: [label, username],
					selected,
					...props
				}) => (
					<Option key={username} value={value} {...props}>
						<Box is="span">
							<Avatar
								style={{ marginInlineEnd: '0.25rem' }}
								value={username}
							/>
							{label}
						</Box>
					</Option>
				)}
				options={options}
			/>
		);
	},
	(prevProps, props) =>
		prevProps.conditions === props.conditions &&
		prevProps.exceptions === props.exceptions
);

export default UserAutoCompleteMultiple;
