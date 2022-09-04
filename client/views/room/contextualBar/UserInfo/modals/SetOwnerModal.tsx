import React, { FC, useCallback, useState } from 'react';
import {
    Button,
    ButtonGroup,
    Icon,
    Modal,
    Box,
    Margins
} from '@rocket.chat/fuselage';
import { useTranslation } from '/client/contexts/TranslationContext';
import { UserAutoComplete } from '/client/components/AutoComplete';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useEndpointActionExperimental } from '/client/hooks/useEndpointAction';
import { useUserId } from '/client/contexts/UserContext';

type OriginalActionParams = {
    roomId: string;
    userId: string | undefined;
};

type SetOwnerModalProps = {
    onClose: () => void;
    onSuccess: () => void | undefined;
    roomId: string;
    userId: string;
    originalAction: (params: OriginalActionParams) => Promise<void>;
    endpointType: string;
    originalSuccessMessage: string;
};

const SetOwnerModal: FC<SetOwnerModalProps> = ({
    onClose,
    onSuccess,
    roomId,
    userId,
    originalAction,
    endpointType,
    originalSuccessMessage,
    ...props
}) => {
    const t = useTranslation();
    const uid = userId ?? useUserId();
    const handleSetOwner = useEndpointActionExperimental(
        'POST',
        `${endpointType}.addOwner`,
        originalSuccessMessage
    );
    const [selectedUser, setSelectedUser] = useState('');
    const handleSubmit = useCallback(async () => {
        if (selectedUser) {
            await handleSetOwner({ roomId, username: selectedUser });
            await originalAction({ roomId, userId });
            onClose();
            onSuccess?.();
        }
    }, [selectedUser, originalAction]);
    return (
        <Modal {...props}>
            <Modal.Header>
                <Icon name='shield' size={20} />
                <Modal.Title>{t('Replace_Owner')}</Modal.Title>
                <Modal.Close onClick={onClose} />
            </Modal.Header>
            <Modal.Content fontScale='p1'>
                <Box display='flex' flexDirection='column'>
                    <Margins block='x24'>
                        {t('Replace_Owner_Text')}
                        {
                            <UserAutoComplete
                                value={selectedUser}
                                placeholder={t('Select_user')}
                                onChange={useMutableCallback(value =>
                                    setSelectedUser(value)
                                )}
                                conditions={{
                                    $and: [
                                        { __rooms: { $eq: roomId } },
                                        { _id: { $ne: uid } }
                                    ]
                                }}
                            />
                        }
                    </Margins>
                </Box>
            </Modal.Content>
            <Modal.Footer>
                <ButtonGroup align='end'>
                    <Button primary onClick={handleSubmit}>
                        {t('Replace_Owner')}
                    </Button>
                </ButtonGroup>
            </Modal.Footer>
        </Modal>
    );
};

export default SetOwnerModal;
