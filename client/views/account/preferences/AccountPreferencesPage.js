import React, { useState, useCallback, useRef } from 'react';
import { ButtonGroup, Button, Box, Accordion } from '@rocket.chat/fuselage';

import { useTranslation } from '../../../contexts/TranslationContext';
import { useToastMessageDispatch } from '../../../contexts/ToastMessagesContext';
import { useSetting } from '../../../contexts/SettingsContext';
import { useMethod } from '../../../contexts/ServerContext';
import Page from '../../../components/Page';
import PreferencesLocalizationSection from './PreferencesLocalizationSection';
import PreferencesUserPresenceSection from './PreferencesUserPresenceSection';
import PreferencesNotificationsSection from './PreferencesNotificationsSection';
import PreferencesMessagesSection from './PreferencesMessagesSection';
import PreferencesHighlightsSection from './PreferencesHighlightsSection';
import PreferencesSoundSection from './PreferencesSoundSection';
import PreferencesMyDataSection from './PreferencesMyDataSection';
import PreferencesGlobalSection from './PreferencesGlobalSection';

const AccountPreferencesPage = () => {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	const [hasAnyChange, setHasAnyChange] = useState(false);

	const saveData = useRef({});
	const commitRef = useRef({});

	const dataDownloadEnabled = useSetting('UserData_EnableDownload');

	const onChange = useCallback(
		({ initialValue, value, key }) => {
			const { current } = saveData;
			if (JSON.stringify(initialValue) !== JSON.stringify(value)) {
				current[key] = value;
			} else {
				delete current[key];
			}

			const anyChange = !!Object.values(current).length;
			if (anyChange !== hasAnyChange) {
				setHasAnyChange(anyChange);
			}
		},
		[hasAnyChange]
	);

	const saveFn = useMethod('saveUserPreferences');

	const handleSave = useCallback(async () => {
		try {
			const { current: data } = saveData;
			if (data.highlights || data.hightlights === '') {
				Object.assign(data, {
					highlights: data.highlights
						.split(/,|\n/)
						.map(val => val.trim())
						.filter(Boolean)
				});
			}

			if (data.dontAskAgainList) {
				const list =
					Array.isArray(data.dontAskAgainList) &&
					data.dontAskAgainList.length > 0
						? data.dontAskAgainList.map(([action, label]) => ({
								action,
								label
						  }))
						: [];
				Object.assign(data, { dontAskAgainList: list });
			}

			await saveFn(data);
			saveData.current = {};
			setHasAnyChange(false);
			Object.values(commitRef.current).forEach(fn => fn());

			dispatchToastMessage({
				type: 'success',
				message: t('Preferences_saved')
			});
		} catch (e) {
			dispatchToastMessage({ type: 'error', message: e });
		}
	}, [dispatchToastMessage, saveFn, t]);

	return (
		<Page>
			<Page.Header title={t('Preferences')}>
				<ButtonGroup>
					<Button
						primary
						disabled={!hasAnyChange}
						onClick={handleSave}
					>
						{t('Save_changes')}
					</Button>
				</ButtonGroup>
			</Page.Header>
			<Page.ScrollableContentWithShadow>
				<Box maxWidth="x600" w="full" alignSelf="center">
					<Accordion>
						<PreferencesNotificationsSection
							commitRef={commitRef}
							onChange={onChange}
						/>
						<PreferencesSoundSection
							commitRef={commitRef}
							onChange={onChange}
						/>
					</Accordion>
				</Box>
			</Page.ScrollableContentWithShadow>
		</Page>
	);
};

export default AccountPreferencesPage;
