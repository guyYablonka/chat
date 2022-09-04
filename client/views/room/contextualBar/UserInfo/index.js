import React, { useMemo } from 'react';
import {
	Box,
	Margins,
	Tag,
	Button,
	Chevron,
	Icon,
	Tile
} from '@rocket.chat/fuselage';
import { css } from '@rocket.chat/css-in-js';

import { useTranslation } from '../../../../contexts/TranslationContext';
import { useSetting } from '../../../../contexts/SettingsContext';
import { ReactiveUserStatus } from '../../../../components/UserStatus';
import UserCard from '../../../../components/UserCard';
import VerticalBar from '../../../../components/VerticalBar';
import { useRolesDescription } from '../../../../contexts/AuthorizationContext';
import { UTCClock } from '../../../../components/UTCClock';
import UserAvatar from '../../../../components/avatar/UserAvatar';
import MarkdownText from '../../../../components/MarkdownText';
import UserActions from './actions/UserActions';
import { useEndpointData } from '../../../../hooks/useEndpointData';
import { AsyncStatePhase } from '../../../../hooks/useAsyncState';
import { getUserEmailAddress } from '../../../../lib/getUserEmailAddress';
import { FormSkeleton } from '../../../../components/Skeleton';
import { getUserEmailVerified } from '../../../../lib/getUserEmailVerified';
import { RoomActions } from '../Info/RoomInfo/RoomActions';
import { useFormatDateAndTime } from '/client/hooks/useFormatDateAndTime';

const Label = props => <Box fontScale="p2" color="default" {...props} />;

const wordBreak = css`
	word-break: break-word;
`;

const Info = ({ className, ...props }) => (
	<UserCard.Info
		className={[className, wordBreak]}
		flexShrink={0}
		{...props}
	/>
);
const Avatar = ({ username, ...props }) => (
	<UserAvatar title={username} username={username} {...props} />
);
const Username = ({ username, ...props }) => (
	<UserCard.Username
		multiline
		showStatus={false}
		name={username}
		{...props}
	/>
);

const renderCustomFields = fields => {
	const t = useTranslation();
	let customFieldsToDisplay;
	try {
		customFieldsToDisplay = JSON.parse(
			useSetting('Accounts_CustomFieldsToShowInUserInfo')
		);
	} catch {}

	return Object.entries(customFieldsToDisplay)?.map(
		([label, value]) =>
			fields?.[value] && (
				<Box mb="5%" key={label}>
					<Label>{t(label)}</Label>
					<Info>{fields?.[value]}</Info>
				</Box>
			)
	);
};

export const UserInfo = React.memo(function UserInfo({
	username,
	bio,
	email,
	verified,
	showRealNames,
	status,
	phone,
	customStatus,
	roles = [],
	lastLogin,
	createdAt,
	utcOffset,
	customFields = [],
	name,
	data,
	nickname,
	// onChange,
	actions,
	...props
}) {
	const t = useTranslation();

	const timeAgo = useFormatDateAndTime();

	return (
		<VerticalBar.ScrollableContent {...props}>
			<Tile
				elevation="2"
				display="flex"
				flexDirection="column"
				alignItems="center"
			>
				<Avatar
					size={'x124'}
					username={username}
					etag={data?.avatarETag}
				/>
				<Username
					textAlign="center"
					mbs="5%"
					username={name}
					status={status}
				/>
				<Info mbs="2%">{'@' + username}</Info>
			</Tile>

			<Tile elevation="2">
				<Box is="h2">{t('General_Details')}</Box>
				{email && (
					<Box mbs="5%">
						{' '}
						<Label>{t('Email')}</Label>
						<Box is="a" withTruncatedText href={`mailto:${email}`}>
							{email}
						</Box>
					</Box>
				)}

				{username && username !== name && (
					<Box mbs="5%">
						<Label>{t('Username')}</Label>
						<Info>{username}</Info>
					</Box>
				)}

				{renderCustomFields(customFields)}

				<Box mbs="5%">
					<Label>{t('Created_at')}</Label>
					<Info>{timeAgo(createdAt)}</Info>
				</Box>

				<Box mbs="5%">
					<Label>{t('Last_login')}</Label>
					<Info>{lastLogin ? timeAgo(lastLogin) : t('Never')}</Info>
				</Box>

				{phone && (
					<Box mbs="5%">
						{' '}
						<Label>{t('Phone')}</Label>
						<Info
							display="flex"
							flexDirection="row"
							alignItems="center"
						>
							<Box is="a" withTruncatedText href={`tel:${phone}`}>
								{phone}
							</Box>
						</Info>
					</Box>
				)}

				{nickname && (
					<Box mbs="5%">
						<Label>{t('Nickname')}</Label>
						<Info>{nickname}</Info>
					</Box>
				)}

				{bio && (
					<Box mbs="5%">
						<Label>{t('Bio')}</Label>
						<Info withTruncatedText={false}>
							<MarkdownText content={bio} />
						</Info>
					</Box>
				)}
			</Tile>

			<Tile elevation="2">
				<Box is="h2" margin="0 0 3% 0">
					{t('Roles')}
				</Box>
				{!!roles ? (
					<UserCard.Roles>{roles}</UserCard.Roles>
				) : (
					<Label>{t('No_Available_Roles')}</Label>
				)}
			</Tile>

			{actions}
		</VerticalBar.ScrollableContent>
	);
});

export const Action = ({ icon, label, chevron, ...props }) => (
	<Tile elevation="2" mbe="2%" padding="0">
		<Button title={label} width="100%" ghost {...props}>
			<Icon name={icon} size="x20" mie="x4" />
			{label}
			<Box is="span" style={{ float: 'left' }}>
				{chevron && <Chevron right is="a" color="black" />}
			</Box>
		</Button>
	</Tile>
);

UserInfo.Action = Action;
UserInfo.Avatar = Avatar;
UserInfo.Info = Info;
UserInfo.Label = Label;
UserInfo.Username = Username;

export const UserInfoWithData = React.memo(function UserInfoWithData({
	uid,
	username,
	tabBar,
	rid,
	roomType,
	onClickClose,
	onClose = onClickClose,
	video,
	onClickBack,
	...props
}) {
	const t = useTranslation();

	const getRoles = useRolesDescription();

	const showRealNames = useSetting('UI_Use_Real_Name');

	const {
		value,
		phase: state,
		error
	} = useEndpointData(
		'users.info',
		useMemo(
			() => ({
				...(uid && { userId: uid }),
				...(username && { username })
			}),
			[uid, username]
		)
	);

	const user = useMemo(() => {
		const { user } = value || { user: {} };
		const {
			_id,
			name,
			username,
			roles = [],
			status = null,
			statusText,
			bio,
			utcOffset,
			lastLogin,
			nickname
		} = user;
		return {
			_id,
			name: showRealNames ? name : username,
			username,
			lastLogin,
			roles:
				roles &&
				getRoles(roles).map((role, index) => (
					<UserCard.Role key={index}>{role}</UserCard.Role>
				)),
			bio,
			phone: user.phone,
			customFields: user.customFields,
			verified: getUserEmailVerified(user),
			email: getUserEmailAddress(user),
			utcOffset,
			createdAt: user.createdAt,
			// localTime: <LocalTime offset={utcOffset} />,
			status: status && (
				<ReactiveUserStatus uid={_id} presence={status} />
			),
			customStatus: statusText,
			nickname
		};
	}, [value, showRealNames, getRoles]);

	return (
		<>
			<VerticalBar.Header>
				{onClickBack && <VerticalBar.Back onClick={onClickBack} />}
				<Icon name="user" size="x24" />
				<VerticalBar.Text>{t('User_Info')}</VerticalBar.Text>
				{onClose && <VerticalBar.Close onClick={onClose} />}
			</VerticalBar.Header>

			{(error && (
				<VerticalBar.Content>
					<Box mbs="x16">{t('User_not_found')}</Box>
				</VerticalBar.Content>
			)) ||
				(state === AsyncStatePhase.LOADING && (
					<VerticalBar.Content>
						<FormSkeleton />
					</VerticalBar.Content>
				)) || (
					<UserInfo
						{...user}
						data={user}
						// onChange={onChange}
						actions={
							<>
								{roomType === 'd' && (
									<RoomActions
										rid={rid}
										roomType={roomType}
									/>
								)}
								<UserActions user={user} rid={rid} />
							</>
						}
						{...props}
						p="x24"
					/>
				)}
		</>
	);
});

export default UserInfoWithData;
