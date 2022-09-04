import React, { useMemo } from 'react';
import { Sidebar } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';

import { popover, modal } from '../../../../app/ui-utils';
import {
	useAtLeastOnePermission,
	usePermission
} from '../../../contexts/AuthorizationContext';
import { useSetting } from '../../../contexts/SettingsContext';
import { useTranslation } from '../../../contexts/TranslationContext';

const CREATE_CHANNEL_PERMISSIONS = ['create-c', 'create-p'];

const openPopover = (e, items) =>
	popover.open({
		columns: [
			{
				groups: [
					{
						items
					}
				]
			}
		],
		currentTarget: e.currentTarget,
		offsetVertical: e.currentTarget.clientHeight + 10
	});

const useAction = (title, content) =>
	useMutableCallback(e => {
		e.preventDefault();
		modal.open({
			title,
			content,
			data: {
				onCreate() {
					modal.close();
				}
			},
			modifier: 'modal',
			showConfirmButton: false,
			showCancelButton: false,
			confirmOnEnter: false
		});
	});

const CreateRoom = props => {
	const t = useTranslation();

	const canCreateChannel = useAtLeastOnePermission(
		CREATE_CHANNEL_PERMISSIONS
	);
	const createChannel = useAction(t('Create_A_New_Channel'), 'createChannel');

	const createChannelAction = canCreateChannel && {
		icon: 'hashtag',
		name: t('Channel'),
		qa: 'sidebar-create-channel',
		action: createChannel
	};

	const onClick = useMutableCallback(e => createChannelAction.action(e));

	return canCreateChannel ? (
		<Sidebar.TopBar.Action
			{...props}
			icon="edit-rounded"
			onClick={onClick}
		/>
	) : null;
};

export default CreateRoom;
