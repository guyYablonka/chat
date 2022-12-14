import {
	Button,
	ButtonGroup,
	Icon,
	Field,
	FieldGroup,
	TextInput,
	Throbber
} from '@rocket.chat/fuselage';
import React, { useCallback, useEffect, useState } from 'react';

import Page from '../../../components/Page';
import {
	useRoute,
	useQueryStringParameter
} from '../../../contexts/RouterContext';
import { useEndpoint, useUpload } from '../../../contexts/ServerContext';
import { useTranslation } from '../../../contexts/TranslationContext';
import { useFileInput } from '../../../hooks/useFileInput';
import { useForm } from '../../../hooks/useForm';
import { handleInstallError } from './helpers';
import AppPermissionsReviewModal from './AppPermissionsReviewModal';
import { useSetModal } from '../../../contexts/ModalContext';
import { getPermissionsFromZippedApp } from './lib/getPermissionsFromZippedApp';

const placeholderUrl = 'https://rocket.chat/apps/package.zip';

function AppInstallPage() {
	const t = useTranslation();

	const appsRoute = useRoute('admin-apps');
	const setModal = useSetModal();

	const appId = useQueryStringParameter('id');
	const queryUrl = useQueryStringParameter('url');

	const [installing, setInstalling] = useState(false);

	const endpointAddress = appId ? `/apps/${appId}` : '/apps';
	const downloadApp = useEndpoint('POST', endpointAddress);
	const uploadApp = useUpload(endpointAddress);

	const { values, handlers } = useForm({
		file: {},
		url: queryUrl
	});

	const { file, url } = values;

	const canSave = !!url || !!file.name;

	const { handleFile, handleUrl } = handlers;

	useEffect(() => {
		queryUrl && handleUrl(queryUrl);
	}, [queryUrl, handleUrl]);

	const [handleUploadButtonClick] = useFileInput(handleFile, 'app');

	const sendFile = async (permissionsGranted, appFile) => {
		const fileData = new FormData();
		fileData.append('app', appFile, appFile.name);
		fileData.append('permissions', JSON.stringify(permissionsGranted));
		const { app } = await uploadApp(fileData);
		appsRoute.push({ context: 'details', id: app.id });
		setModal(null);
	};

	const cancelAction = useCallback(() => {
		setInstalling(false);
		setModal(null);
	}, [setInstalling, setModal]);

	const install = async () => {
		setInstalling(true);

		try {
			let permissions;
			let appFile;
			if (url) {
				const { buff } = await downloadApp({ url, downloadOnly: true });
				const fileData = Uint8Array.from(buff.data);
				permissions = await getPermissionsFromZippedApp(fileData);
				appFile = new File([fileData], 'app.zip', {
					type: 'application/zip'
				});
			} else {
				appFile = file;
				permissions = await getPermissionsFromZippedApp(appFile);
			}

			if (!permissions || permissions.length === 0) {
				await sendFile(permissions, appFile);
			} else {
				setModal(
					<AppPermissionsReviewModal
						appPermissions={permissions}
						cancel={cancelAction}
						confirm={permissions => sendFile(permissions, appFile)}
					/>
				);
			}
		} catch (error) {
			handleInstallError(error);
		} finally {
			setInstalling(false);
		}
	};

	const handleCancel = () => {
		appsRoute.push();
	};

	return (
		<Page flexDirection="column">
			<Page.Header title={t('App_Installation')} />
			<Page.ScrollableContent>
				<FieldGroup
					display="flex"
					flexDirection="column"
					alignSelf="center"
					maxWidth="x600"
					w="full"
				>
					<Field>
						<Field.Label>
							{t('App_Url_to_Install_From')}
						</Field.Label>
						<Field.Row>
							<TextInput
								placeholder={placeholderUrl}
								value={url}
								onChange={handleUrl}
								addon={<Icon name="permalink" size="x20" />}
							/>
						</Field.Row>
					</Field>
					<Field>
						<Field.Label>
							{t('App_Url_to_Install_From_File')}
						</Field.Label>
						<Field.Row>
							<TextInput
								value={file.name || ''}
								addon={
									<Button
										small
										primary
										onClick={handleUploadButtonClick}
										mb="neg-x4"
										mie="neg-x8"
									>
										<Icon name="upload" size="x12" />
										{t('Browse_Files')}
									</Button>
								}
							/>
						</Field.Row>
					</Field>
					<Field>
						<ButtonGroup>
							<Button
								disabled={!canSave || installing}
								onClick={install}
							>
								{!installing && t('Install')}
								{installing && <Throbber inheritColor />}
							</Button>
							<Button onClick={handleCancel}>
								{t('Cancel')}
							</Button>
						</ButtonGroup>
					</Field>
				</FieldGroup>
			</Page.ScrollableContent>
		</Page>
	);
}

export default AppInstallPage;
