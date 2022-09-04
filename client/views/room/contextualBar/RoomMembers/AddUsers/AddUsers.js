import React from 'react';
import { Field, Button, ButtonGroup } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';

import { useForm } from '../../../../../hooks/useForm';
import { useTranslation } from '../../../../../contexts/TranslationContext';
import { useMethod } from '../../../../../contexts/ServerContext';
import { useToastMessageDispatch } from '../../../../../contexts/ToastMessagesContext';
import { useTabBarClose } from '../../../providers/ToolboxProvider';
import UserAutoCompleteMultiple from '../../../../../../ee/client/audit/UserAutoCompleteMultiple';
import VerticalBar from '../../../../../components/VerticalBar';

export const AddUsers = ({
	onClickClose,
	onClickBack,
	onClickSave,
	value,
	onChange,
	conditions,
	exceptions
}) => {
	const t = useTranslation();
	return (
		<>
			<VerticalBar.Header>
				{onClickBack && <VerticalBar.Back onClick={onClickBack} />}
				<VerticalBar.Text>{t('Invite_Users')}</VerticalBar.Text>
				{onClickClose && <VerticalBar.Close onClick={onClickClose} />}
			</VerticalBar.Header>
			<VerticalBar.ScrollableContent>
				<Field>
					<UserAutoCompleteMultiple
						value={value}
						conditions={conditions}
						exceptions={exceptions}
						onChange={onChange}
						placeholder={t('Please_enter_usernames')}
					/>
				</Field>
			</VerticalBar.ScrollableContent>
			<VerticalBar.Footer display='flex' justifyContent='center'>
				<ButtonGroup vertical>
					<Button
						primary
						disabled={!value?.length}
						onClick={onClickSave}
					>
						{t('Add_users')}
					</Button>
				</ButtonGroup>
			</VerticalBar.Footer>
		</>
	);
};

export default ({ rid, onClickBack, reload }) => {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	const onClickClose = useTabBarClose();
	const saveAction = useMethod('addUsersToRoom');

	const { values, handlers } = useForm({ users: [] });
	const { users } = values;
	const { handleUsers } = handlers;

	const onChangeUsers = useMutableCallback((value, action) => {
		if (!action) {
			return handleUsers([...users, value]);
		}
		handleUsers(users.filter(current => !current.includes(value)));
	});

	const handleSave = useMutableCallback(async () => {
		try {
			const usersToAdd = users.map(user => {
				const [name, username] = user.split('$~^%');
				return { name, username };
			});
			await saveAction({ rid, users: usersToAdd });
			dispatchToastMessage({
				type: 'success',
				message: t('Users_added')
			});
			typeof reload === 'function' && reload();
			onClickBack ? onClickBack() : onClickClose();
		} catch (e) {
			dispatchToastMessage({ type: 'error', message: e });
		}
	});

	return (
		<AddUsers
			onClickClose={onClickClose}
			onClickBack={onClickBack}
			onClickSave={handleSave}
			value={users}
			onChange={onChangeUsers}
			conditions={{ __rooms: { $ne: rid } }}
			exceptions={users.map(user => user.split('$~^%')[1])}
		/>
	);
};
