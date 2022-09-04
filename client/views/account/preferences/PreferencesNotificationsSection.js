import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
	Accordion,
	Field,
	Select,
	FieldGroup,
	ToggleSwitch,
	Button,
	Box
} from '@rocket.chat/fuselage';

import { KonchatNotification } from '../../../../app/ui';
import { useTranslation } from '../../../contexts/TranslationContext';
import { useUserPreference } from '../../../contexts/UserContext';
import { useForm } from '../../../hooks/useForm';
import { useSetting } from '../../../contexts/SettingsContext';

const notificationOptionsLabelMap = {
	all: 'All_messages',
	mentions: 'Mentions',
	nothing: 'Nothing'
};

const emailNotificationOptionsLabelMap = {
	mentions: 'Email_Notification_Mode_All',
	nothing: 'Email_Notification_Mode_Disabled'
};

const PreferencesNotificationsSection = ({ onChange, commitRef, ...props }) => {
	const t = useTranslation();

	const [notificationsPermission, setNotificationsPermission] = useState();
	
	const userDesktopNotifications = useUserPreference('desktopNotifications');

	const defaultDesktopNotifications = useSetting(
		'Accounts_Default_User_Preferences_desktopNotifications'
	);

	const { values, handlers, commit } = useForm(
		{
			desktopNotifications: userDesktopNotifications,
		},
		onChange
	);

	const {
		desktopNotifications
	} = values;

	const {
		handleDesktopNotifications,
	} = handlers;

	useEffect(
		() =>
			setNotificationsPermission(
				window.Notification && Notification.permission
			),
		[]
	);

	commitRef.current.notifications = commit;	

	const notificationOptions = useMemo(
		() =>
			Object.entries(notificationOptionsLabelMap).map(([key, val]) => [
				key,
				t(val)
			]),
		[t]
	);

	const desktopNotificationOptions = useMemo(() => {
		const optionsCp = notificationOptions.slice();
		optionsCp.unshift([
			'default',
			`${t('Default')} (${t(
				notificationOptionsLabelMap[defaultDesktopNotifications]
			)})`
		]);
		return optionsCp;
	}, [defaultDesktopNotifications, notificationOptions, t]);

	

	return (
		<Accordion.Item title={t('Notifications')} {...props}>
			<FieldGroup>
				<Field>
					<Field.Label>
						{t('Notification_Desktop_Default_For')}
					</Field.Label>
					<Field.Row>
						<Select
							value={desktopNotifications}
							onChange={handleDesktopNotifications}
							options={desktopNotificationOptions}
						/>
					</Field.Row>
				</Field>
			</FieldGroup>
		</Accordion.Item>
	);
};

export default PreferencesNotificationsSection;
