import React, { useState, useCallback } from 'react';
import {
	Box,
	Button,
	Icon,
	TextInput,
	Margins,
	Avatar
} from '@rocket.chat/fuselage';

import { useTranslation } from '../../contexts/TranslationContext';
import { useFileInput } from '../../hooks/useFileInput';
import UserAvatar from './UserAvatar';

function UserAvatarSuggestions({
	suggestions,
	setAvatarObj,
	setNewAvatarSource,
	disabled,
	...props
}) {
	const handleClick = useCallback(
		suggestion => () => {
			setAvatarObj(suggestion);
			setNewAvatarSource(suggestion.blob);
		},
		[setAvatarObj, setNewAvatarSource]
	);

	return (
		<Margins inline="x4" {...props}>
			{Object.values(suggestions).map(suggestion => (
				<Button
					key={suggestion.service}
					disabled={disabled}
					square
					onClick={handleClick(suggestion)}
				>
					<Box mie="x4">
						<Avatar
							title={suggestion.service}
							url={suggestion.blob}
						/>
					</Box>
				</Button>
			))}
		</Margins>
	);
}

export function UserAvatarEditor({
	currentUsername,
	username,
	setAvatarObj,
	suggestions,
	disabled,
	etag
}) {
	const t = useTranslation();
	const [avatarFromUrl, setAvatarFromUrl] = useState('');
	const [newAvatarSource, setNewAvatarSource] = useState();

	const setUploadedPreview = useCallback(
		async (file, avatarObj) => {
			setAvatarObj(avatarObj);
			setNewAvatarSource(URL.createObjectURL(file));
		},
		[setAvatarObj]
	);

	const [clickUpload] = useFileInput(setUploadedPreview);

	const clickUrl = () => {
		setNewAvatarSource(avatarFromUrl);
		setAvatarObj({ avatarUrl: avatarFromUrl });
	};
	const clickReset = () => {
		setNewAvatarSource(`/avatar/%40${username}`);
		setAvatarObj('reset');
	};

	const url = newAvatarSource;

	const handleAvatarFromUrlChange = event => {
		setAvatarFromUrl(event.currentTarget.value);
	};

	return (
		<Box display="flex" flexDirection="column" fontScale="p2">
			<Box compnent="span" display="block" textAlign="center" mbs="x4">
				<UserAvatar
					size="x124"
					url={url}
					username={currentUsername}
					etag={etag}
					style={{ objectFit: 'contain' }}
					rounded={true}
					mie="x4"
				/>
			</Box>
		</Box>
	);
}

export default UserAvatarEditor;
