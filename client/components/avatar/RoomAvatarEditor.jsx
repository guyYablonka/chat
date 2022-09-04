import { css } from '@rocket.chat/css-in-js';
import { Box, Button, ButtonGroup, Icon } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React, { useEffect } from 'react';
import { isNumber } from 'underscore';
import { useTranslation } from '../../contexts/TranslationContext';
import { useFileInput } from '../../hooks/useFileInput';
import RoomAvatar from './RoomAvatar';
import { getAvatarURL } from '/app/utils/lib/getAvatarURL';

const RoomAvatarEditor = ({
    room,
    roomAvatar,
    onChangeAvatar = () => {},
    ...props
}) => {
    const t = useTranslation();

    const handleChangeAvatar = useMutableCallback(file => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            onChangeAvatar(reader.result);
        };
    });

    const [clickUpload, reset] = useFileInput(handleChangeAvatar);
    const clickReset = useMutableCallback(() => {
        reset();
        onChangeAvatar(null);
    });

    useEffect(() => {
        !roomAvatar && reset();
    }, [roomAvatar, reset]);

    const defaultUrl = room.prid
        ? getAvatarURL({ roomId: room.prid })
        : getAvatarURL({ username: `@${room.name}` }); // Discussions inherit avatars from the parent room

    const isUploadNewImageMode = roomAvatar || !isNumber(room.avatarETag);

    const urlByRoomNameAfterReset = () => {
        return { url: getAvatarURL({ username: `@${room.name}` }) };
    };

    const urlByNewImage = () => {
        return {
            url: roomAvatar === null ? defaultUrl : roomAvatar
        };
    };

    return (
        <Box
            borderRadius='x2'
            maxWidth='x332'
            w='full'
            position='relative'
            {...props}
        >
            <RoomAvatar
                {...(isUploadNewImageMode
                    ? urlByNewImage()
                    : urlByRoomNameAfterReset())}
                room={room}
                size='x124'
                style={{ marginRight: '6.75rem' }}
            />
            <Box
                className={[
                    css`
                        bottom: 0;
                        right: 0;
                    `
                ]}
                m='x12'
            >
                <ButtonGroup>
                    <Button
                        small
                        title={t('Upload_user_avatar')}
                        onClick={clickUpload}
                    >
                        <Icon name='upload' size='x16' />
                        {t('Upload')}
                    </Button>

                    <Button
                        primary
                        small
                        danger
                        title={t('Accounts_SetDefaultAvatar')}
                        disabled={roomAvatar === null}
                        onClick={clickReset}
                    >
                        <Icon name='trash' size='x16' />
                    </Button>
                </ButtonGroup>
            </Box>
        </Box>
    );
};

export default RoomAvatarEditor;
