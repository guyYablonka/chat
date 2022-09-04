import { css } from '@rocket.chat/css-in-js';
import { Box, Callout, Icon, Tile } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React from 'react';
import { isNumber } from 'underscore';
import {
    roomTypes,
    RoomTypes,
    UiTextContext
} from '../../../../../../app/utils';
import RoomAvatar from '../../../../../components/avatar/RoomAvatar';
import DeleteChannelWarning from '../../../../../components/DeleteChannelWarning';
import MarkdownText from '../../../../../components/MarkdownText';
import UserCard from '../../../../../components/UserCard';
import VerticalBar from '../../../../../components/VerticalBar';
import { usePermission } from '../../../../../contexts/AuthorizationContext';
import { useSetModal } from '../../../../../contexts/ModalContext';
import { useRoute } from '../../../../../contexts/RouterContext';
import { useMethod } from '../../../../../contexts/ServerContext';
import { useSetting } from '../../../../../contexts/SettingsContext';
import { useToastMessageDispatch } from '../../../../../contexts/ToastMessagesContext';
import { useTranslation } from '../../../../../contexts/TranslationContext';
import { useUserRoom } from '../../../../../contexts/UserContext';
import WarningModal from '../../../../admin/apps/WarningModal';
import { useTabBarClose } from '../../../providers/ToolboxProvider';
import { UserInfo } from '../../UserInfo';
import SetOwnerModal from '../../UserInfo/modals/SetOwnerModal';
import { RoomActions } from './RoomActions';
import { getAvatarURL } from '/app/utils/lib/getAvatarURL';

const retentionPolicyMaxAge = {
    c: 'RetentionPolicy_MaxAge_Channels',
    p: 'RetentionPolicy_MaxAge_Groups',
    d: 'RetentionPolicy_MaxAge_DMs'
};

const retentionPolicyAppliesTo = {
    c: 'RetentionPolicy_AppliesToChannels',
    p: 'RetentionPolicy_AppliesToGroups',
    d: 'RetentionPolicy_AppliesToDMs'
};

const wordBreak = css`
    word-break: break-word !important;
`;

const Label = props => <Box fontScale='p2' color='default' {...props} />;
const Info = ({ className, ...props }) => (
    <UserCard.Info
        className={[className, wordBreak]}
        flexShrink={0}
        {...props}
    />
);

export const RoomInfoIcon = ({ name }) => <Icon name={name} size='x22' />;

export const Title = props => <UserCard.Username multiline {...props} />;

export const RoomInfo = function RoomInfo({
    fname: name,
    description,
    archived,
    broadcast,
    announcement,
    topic,
    type,
    rid,
    avatarETag,
    icon,
    retentionPolicy = {},
    onClickHide,
    onClickClose,
    onClickLeave,
    onClickEdit,
    onClickDelete
}) {
    const t = useTranslation();
    const options = [
        { onClick: onClickHide, title: 'Hide', icon: 'eye-off' },
        { onClick: onClickEdit, title: 'Edit', icon: 'edit' },
        {
            onClick: onClickLeave,
            title: 'Leave',
            icon: 'sign-out',
            danger: true
        },
        { onClick: onClickDelete, title: 'Delete', icon: 'trash', danger: true }
    ];

    const {
        retentionPolicyEnabled,
        filesOnlyDefault,
        excludePinnedDefault,
        maxAgeDefault
    } = retentionPolicy;

    return (
        <>
            <VerticalBar.Header>
                <VerticalBar.Icon name='info-circled' />
                <VerticalBar.Text>{t('Room_Info')}</VerticalBar.Text>
                {onClickClose && <VerticalBar.Close onClick={onClickClose} />}
            </VerticalBar.Header>

            <VerticalBar.ScrollableContent p='x24'>
                <Box flexGrow={1}>
                    <Tile
                        mbe='x24'
                        elevation='2'
                        display='flex'
                        flexDirection='column'
                        alignItems='center'
                    >
                        <RoomAvatar
                            size={'x124'}
                            room={{
                                _id: rid,
                                type,
                                t: type,
                                avatarETag
                            }}
                            {...(isNumber(avatarETag) && {
                                url: getAvatarURL({ username: `@${name}` })
                            })}
                        />
                        <RoomInfo.Title
                            mbs='2%'
                            mie='2%'
                            name={name}
                            status={<RoomInfo.Icon name={icon} />}
                        >
                            {name}
                        </RoomInfo.Title>
                        {archived && (
                            <Callout type='warning'>
                                {t('Room_archived')}
                            </Callout>
                        )}
                    </Tile>

                    <Tile elevation='2' mbe='x24'>
                        <Box is='h2'>{t('General_Details')}</Box>

                        {
                            <Box pbe='x16'>
                                <Label>{t('Topic')}</Label>
                                <Info withTruncatedText={false}>
                                    {topic ?? ''}
                                </Info>
                            </Box>
                        }

                        {
                            <Box pbe='x16'>
                                <Label>{t('Announcement')}</Label>
                                <Info withTruncatedText={false}>
                                    {announcement ?? ''}
                                </Info>
                            </Box>
                        }

                        {
                            <Box pbe='x16'>
                                <Label>{t('Description')}</Label>
                                <Info withTruncatedText={false}>
                                    {description ?? ''}
                                </Info>
                            </Box>
                        }

                        {broadcast && broadcast !== '' && (
                            <Box pbe='x16'>
                                <Label>
                                    <b>{t('Broadcast_channel')}</b>{' '}
                                    {t('Broadcast_channel_Description')}
                                </Label>
                            </Box>
                        )}
                    </Tile>

                    <RoomActions mbe='x16' rid={rid} roomType={type} />

                    {retentionPolicyEnabled && (
                        <Callout type='warning'>
                            {filesOnlyDefault && excludePinnedDefault && (
                                <p>
                                    {t(
                                        'RetentionPolicy_RoomWarning_FilesOnly',
                                        { time: maxAgeDefault }
                                    )}
                                </p>
                            )}
                            {filesOnlyDefault && !excludePinnedDefault && (
                                <p>
                                    {t(
                                        'RetentionPolicy_RoomWarning_UnpinnedFilesOnly',
                                        { time: maxAgeDefault }
                                    )}
                                </p>
                            )}
                            {!filesOnlyDefault && excludePinnedDefault && (
                                <p>
                                    {t('RetentionPolicy_RoomWarning', {
                                        time: maxAgeDefault
                                    })}
                                </p>
                            )}
                            {!filesOnlyDefault && !excludePinnedDefault && (
                                <p>
                                    {t('RetentionPolicy_RoomWarning_Unpinned', {
                                        time: maxAgeDefault
                                    })}
                                </p>
                            )}
                        </Callout>
                    )}

                    {options.map(
                        ({ onClick, title, icon, danger }) =>
                            onClick && (
                                <UserInfo.Action
                                    danger={danger}
                                    key={title}
                                    title={t(title)}
                                    label={t(title)}
                                    onClick={onClick}
                                    icon={icon}
                                />
                            )
                    )}
                </Box>
            </VerticalBar.ScrollableContent>
        </>
    );
};

RoomInfo.Title = Title;
RoomInfo.Icon = RoomInfoIcon;

export default ({ rid, openEditing }) => {
    const onClickClose = useTabBarClose();
    const t = useTranslation();

    const room = useUserRoom(rid);
    room.type = room.t;
    room.rid = rid;
    const { type, fname, broadcast, archived, joined = true } = room; // TODO implement joined

    const retentionPolicyEnabled = useSetting('RetentionPolicy_Enabled');
    const retentionPolicy = {
        retentionPolicyEnabled,
        maxAgeDefault: useSetting(retentionPolicyMaxAge[room.t]) || 30,
        retentionEnabledDefault: useSetting(retentionPolicyAppliesTo[room.t]),
        excludePinnedDefault: useSetting('RetentionPolicy_DoNotPrunePinned'),
        filesOnlyDefault: useSetting('RetentionPolicy_FilesOnly')
    };

    const dispatchToastMessage = useToastMessageDispatch();
    const setModal = useSetModal();
    const closeModal = useMutableCallback(() => setModal());
    const deleteRoom = useMethod('eraseRoom');
    const hideRoom = useMethod('hideRoom');
    const leaveRoom = useMethod('leaveRoom');
    const router = useRoute('home');

    const canDelete = usePermission(
        type === 'c' ? 'delete-c' : 'delete-p',
        rid
    );

    const canEdit = usePermission('edit-room', rid);

    const canLeave =
        usePermission(type === 'c' ? 'leave-c' : 'leave-p') &&
        room.cl !== false &&
        joined;

    const handleDelete = useMutableCallback(() => {
        const onConfirm = async () => {
            try {
                await deleteRoom(rid);
            } catch (error) {
                dispatchToastMessage({ type: 'error', message: error });
            }
            closeModal();
        };

        setModal(
            <DeleteChannelWarning onConfirm={onConfirm} onCancel={closeModal} />
        );
    });

    const exitRoom = useMutableCallback(async ({ roomId }) => {
        await leaveRoom(roomId);
    });

    const handleLeave = useMutableCallback(() => {
        const leave = async () => {
            try {
                await exitRoom({ roomId: rid });
                closeModal();
            } catch (error) {
                if (error.error === 'error-you-are-last-owner') {
                    setModal(
                        <SetOwnerModal
                            onClose={closeModal}
                            originalAction={exitRoom}
                            endpointType={
                                type === RoomTypes.CHANNEL
                                    ? 'channels'
                                    : 'groups'
                            }
                            roomId={rid}
                        />
                    );
                } else {
                    dispatchToastMessage({ type: 'error', message: error });
                }
            }
        };

        const warnText = roomTypes
            .getConfig(type)
            .getUiText(UiTextContext.LEAVE_WARNING);

        setModal(
            <WarningModal
                text={t(warnText, fname)}
                confirmText={t('Leave_room')}
                close={closeModal}
                cancel={closeModal}
                cancelText={t('Cancel')}
                confirm={leave}
            />
        );
    });

    return (
        <RoomInfo
            archived={archived}
            broadcast={broadcast}
            icon={room.t === 'p' ? 'lock' : 'hashtag'}
            retentionPolicy={retentionPolicyEnabled && retentionPolicy}
            onClickEdit={canEdit && openEditing}
            onClickClose={onClickClose}
            onClickDelete={canDelete && handleDelete}
            onClickLeave={canLeave && handleLeave}
            {...room}
            announcement={
                room.announcement && (
                    <MarkdownText content={room.announcement} />
                )
            }
            description={
                room.description && <MarkdownText content={room.description} />
            }
            topic={room.topic && <MarkdownText content={room.topic} />}
        />
    );
};
