import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React, { useCallback } from 'react';
import { useSetModal } from '../contexts/ModalContext';

import { useEndpoint } from '../contexts/ServerContext';
import { useToastMessageDispatch } from '../contexts/ToastMessagesContext';
import SetOwnerModal from '../views/room/contextualBar/UserInfo/modals/SetOwnerModal';

export const useEndpointAction = (
	httpMethod,
	endpoint,
	params = {},
	successMessage
) => {
	const sendData = useEndpoint(httpMethod, endpoint);
	const dispatchToastMessage = useToastMessageDispatch();

	return useCallback(
		async (...args) => {
			try {
				const data = await sendData(params, ...args);

				if (!data.success) {
					throw new Error(data.status);
				}

				successMessage &&
					dispatchToastMessage({
						type: 'success',
						message: successMessage
					});

				return data;
			} catch (error) {
				dispatchToastMessage({ type: 'error', message: error });
				return { success: false };
			}
		},
		[dispatchToastMessage, params, sendData, successMessage]
	);
};

export const useEndpointActionExperimental = (
	httpMethod,
	endpoint,
	successMessage,
	onSuccess
) => {
	const sendData = useEndpoint(httpMethod, endpoint);
	const dispatchToastMessage = useToastMessageDispatch();
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal(null));

	return useCallback(
		async (params, ...args) => {
			try {
				const data = await sendData(params, ...args);

				if (!data.success) {
					throw new Error(data);
				}

				successMessage &&
					dispatchToastMessage({
						type: 'success',
						message: successMessage
					});

				typeof onSuccess === 'function' && onSuccess();

				return data;
			} catch (error) {
				const { errorType } = error.xhr?.responseJSON ?? {};
				if (
					errorType === 'error-you-are-last-owner' ||
					errorType === 'error-remove-last-owner'
				) {
					setModal(
						<SetOwnerModal
							{...params}
							onClose={closeModal}
							originalAction={sendData}
							onSuccess={onSuccess || undefined}
							originalSuccessMessage={successMessage}
							endpointType={endpoint.split('.')[0]}
						/>
					);
				} else {
					dispatchToastMessage({ type: 'error', message: error });
				}

				return { success: false };
			}
		},
		[dispatchToastMessage, sendData, successMessage, onSuccess]
	);
};
