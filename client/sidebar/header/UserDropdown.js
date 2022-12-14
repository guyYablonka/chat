import React, { useState } from 'react';
import { Box, Margins, Divider, Option } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';

import UserAvatar from '../../components/avatar/UserAvatar';
import { UserStatus } from '../../components/UserStatus';
import { useSetting } from '../../contexts/SettingsContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { useRoute } from '../../contexts/RouterContext';
import { useReactiveValue } from '../../hooks/useReactiveValue';
import { useAtLeastOnePermission } from '../../contexts/AuthorizationContext';
import { userStatus } from '../../../app/user-status';
import { callbacks } from '../../../app/callbacks';
import { popover, AccountBox, modal, SideNav } from '../../../app/ui-utils';
import { darkModeConfig } from '../../startup/theme';

const ADMIN_PERMISSIONS = [
	'view-logs',
	'manage-emoji',
	'manage-sounds',
	'view-statistics',
	'manage-oauth-apps',
	'view-privileged-setting',
	'manage-selected-settings',
	'view-room-administration',
	'view-user-administration',
	'access-setting-permissions',
	'manage-outgoing-integrations',
	'manage-incoming-integrations',
	'manage-own-outgoing-integrations',
	'manage-own-incoming-integrations'
];

const style = {
	marginLeft: '-16px',
	marginRight: '-16px'
};

const setStatus = (status, statusText) => {
	AccountBox.setStatus(status, statusText);
	callbacks.run('userStatusManuallySet', status);
};

const getItems = () => AccountBox.getItems();

const UserDropdown = ({ user, onClose }) => {
	const t = useTranslation();
	const homeRoute = useRoute('home');
	const accountRoute = useRoute('account');
	const adminRoute = useRoute('admin');
	const developersPageRoute = useRoute('developers-page');

	const showPresenceStatus = useSetting('Accounts_ShowPresenceStatus');
	const showLogout = useSetting('Accounts_AllowUserLogout');

	const [isDarkMode, setDarkMode] = useState(
		Meteor._localStorage.getItem(darkModeConfig.DARK_MODE_STORAGE) ===
			'true'
	);

	const { name, username, avatarETag, status, statusText, customFields } =
		user;

	const useRealName = useSetting('UI_Use_Real_Name');
	const showAdmin = useAtLeastOnePermission(ADMIN_PERMISSIONS);

	const handleCustomStatus = useMutableCallback(e => {
		e.preventDefault();
		modal.open({
			title: t('Edit_Status'),
			content: 'editStatus',
			data: {
				onSave() {
					modal.close();
				}
			},
			modalClass: 'modal',
			showConfirmButton: false,
			showCancelButton: false,
			confirmOnEnter: false
		});
		onClose();
	});

	const handleLogout = useMutableCallback(() => {
		Meteor.logout(() => {
			callbacks.run('afterLogoutCleanUp', user);
			Meteor.call('logoutCleanUp', user);
			homeRoute.push({});
			popover.close();
		});
	});

	const handleMyAccount = useMutableCallback(() => {
		accountRoute.push({});
		popover.close();
	});

	const handleDevelopersPage = useMutableCallback(() => {
		developersPageRoute.push({});
		popover.close();
	});

	const handleAdmin = useMutableCallback(() => {
		adminRoute.push({ group: 'info' });
		popover.close();
	});

	const handleDarkMode = useMutableCallback(() => {
		setDarkMode(!isDarkMode);

		document.body.classList.toggle(darkModeConfig.DARK_MODE_CSS);

		localStorage.setItem(
			darkModeConfig.DARK_MODE_STORAGE,
			(!isDarkMode).toString()
		);
	});

	const accountBoxItems = useReactiveValue(getItems);

	const userDisplayName = () => {
		if (customFields?.firstName && customFields?.lastName) {
			return `${customFields.firstName} ${customFields.lastName}`;
		}

		return name.split('/').pop();
	};

	return (
		<Box display="flex" flexDirection="column" maxWidth="244px">
			<Box display="flex" flexDirection="row" mi="neg-x8">
				<Box mie="x4" mis="x8">
					<UserAvatar
						size="x36"
						username={username}
						etag={avatarETag}
					/>
				</Box>
				<Box
					mie="x8"
					mis="x4"
					display="flex"
					overflow="hidden"
					fontScale="p1"
					mb="neg-x4"
					flexGrow={1}
					flexShrink={1}
					className="user-dropdown-name"
				>
					<Box withTruncatedText w="full">
						<Margins inline="x4">
							{showPresenceStatus && (
								<UserStatus status={status} />
							)}
							<Box is="span" withTruncatedText display="flex">
								{useRealName && userDisplayName()}
							</Box>
						</Margins>
					</Box>
					{showPresenceStatus && (
						<Box
							color="hint"
							withTruncatedText
							display="inline-block"
						>
							{statusText || t(status)}
						</Box>
					)}
				</Box>
			</Box>

			{showPresenceStatus && (
				<>
					<Divider mi="neg-x16" mb="x16" borderColor="muted" />
					<div style={style}>
						<Box pi="x16" fontScale="c1" textTransform="uppercase">
							{t('Status')}
						</Box>
						{Object.keys(userStatus.list).map(key => {
							const status = userStatus.list[key];
							const name = status.localizeName
								? t(status.name)
								: status.name;
							const modifier = status.statusType || user.status;

							return (
								<Option
									onClick={() => {
										setStatus(status.statusType, name);
										onClose();
									}}
								>
									<Option.Column>
										<UserStatus status={modifier} />
									</Option.Column>
									<Option.Content
										withTruncatedText
										fontScale="p2"
									>
										{name}
									</Option.Content>
								</Option>
							);
						})}
						<Option
							icon="emoji"
							label={`${t('Custom_Status')}...`}
							onClick={handleCustomStatus}
						/>
					</div>
				</>
			)}

			<Divider mi="neg-x16" mb="x16" />
			<div style={style}>
				<Option
					key="My_Account"
					icon="user"
					label={t('My_Account')}
					onClick={handleMyAccount}
				/>
				<Option
					key="Dark_Mode"
					icon={isDarkMode ? 'sun' : 'moon'}
					label={isDarkMode ? t('Light_Mode') : t('Dark_Mode')}
					onClick={handleDarkMode}
				/>
			</div>

			{!!accountBoxItems.length && (
				<>
					<Divider mi="neg-x16" mb="x16" />
					<div style={style}>
						{accountBoxItems.map((item, i) => {
							let action;

							if (item.href || item.sideNav) {
								action = () => {
									if (item.href) {
										FlowRouter.go(item.href);
										popover.close();
									}
									if (item.sideNav) {
										SideNav.setFlex(item.sideNav);
										SideNav.openFlex();
										popover.close();
									}
								};
							}

							return (
								<Option
									icon={item.icon}
									label={t(item.name)}
									onClick={action}
									key={i}
								/>
							);
						})}
					</div>
				</>
			)}

			<Divider mi="neg-x16" mb="x16" />
			<div style={style}>
				<Option
					key="Developers_Page"
					icon="code"
					label={t('Developers_Page')}
					onClick={handleDevelopersPage}
				/>
				{showAdmin && (
					<Option
						icon={'customize'}
						label={t('Administration')}
						onClick={handleAdmin}
					/>
				)}
				{showLogout && (
					<Option
						key="Logout"
						icon="sign-out"
						label={t('Logout')}
						onClick={handleLogout}
					/>
				)}
			</div>
		</Box>
	);
};

export default UserDropdown;
