import React from 'react';
import { Button, FieldGroup, Box, Margins } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';

import TriggersForm from './TriggersForm';
import { useTranslation } from '../../../contexts/TranslationContext';
import { useMethod } from '../../../contexts/ServerContext';
import { useForm } from '../../../hooks/useForm';
import { useRoute } from '../../../contexts/RouterContext';
import { useToastMessageDispatch } from '../../../contexts/ToastMessagesContext';

const NewTriggerPage = ({ onSave }) => {
	const dispatchToastMessage = useToastMessageDispatch();
	const t = useTranslation();

	const router = useRoute('omnichannel-triggers');

	const save = useMethod('livechat:saveTrigger');

	const { values, handlers } = useForm({
		name: '',
		description: '',
		enabled: true,
		runOnce: false,
		conditions: {
			name: 'page-url',
			value: ''
		},
		actions: {
			name: '',
			params: {
				sender: 'queue',
				msg: '',
				name: ''
			}
		}
	});

	const handleSave = useMutableCallback(async () => {
		try {
			const {
				actions: {
					params: { sender, msg, name }
				},
				...restValues
			} = values;
			await save({
				...restValues,
				conditions: [values.conditions],
				actions: [
					{
						name: 'send-message',
						params: {
							sender,
							msg,
							...(sender === 'custom' && { name })
						}
					}
				]
			});
			dispatchToastMessage({ type: 'success', message: t('Saved') });
			onSave();
			router.push({});
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	});

	const { name } = values;

	return (
		<>
			<FieldGroup>
				<TriggersForm values={values} handlers={handlers} />
			</FieldGroup>
			<Box
				display="flex"
				flexDirection="row"
				justifyContent="space-between"
				w="full"
			>
				<Margins inlineEnd="x4">
					<Button
						flexGrow={1}
						primary
						onClick={handleSave}
						disabled={!name}
					>
						{t('Save')}
					</Button>
				</Margins>
			</Box>
		</>
	);
};

export default NewTriggerPage;
