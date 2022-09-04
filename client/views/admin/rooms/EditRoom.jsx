import {
    Box,
    Button,
    ButtonGroup,
    Callout,
    Field,
    Icon,
    Skeleton,
    TextAreaInput,
    TextInput,
    ToggleSwitch
} from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React, { useCallback, useMemo, useState } from 'react';
import { RoomSettingsEnum, roomTypes } from '../../../../app/utils/client';
import RoomAvatarEditor from '../../../components/avatar/RoomAvatarEditor';
import DeleteChannelWarning from '../../../components/DeleteChannelWarning';
import NotAuthorizedPage from '../../../components/NotAuthorizedPage';
import VerticalBar from '../../../components/VerticalBar';
import { usePermission } from '../../../contexts/AuthorizationContext';
import { useSetModal } from '../../../contexts/ModalContext';
import { useMethod } from '../../../contexts/ServerContext';
import { useTranslation } from '../../../contexts/TranslationContext';
import { AsyncStatePhase } from '../../../hooks/useAsyncState';
import { useEndpointActionExperimental } from '../../../hooks/useEndpointAction';
import { useEndpointData } from '../../../hooks/useEndpointData';
import { useForm } from '../../../hooks/useForm';
import { useSetting } from '/client/contexts/SettingsContext';

const getInitialValues = room => ({
    roomName:
        room.t === 'd'
            ? room.usernames.join(' x ')
            : roomTypes.getRoomName(room.t, { type: room.t, ...room }),
    roomType: room.t,
    readOnly: !!room.ro,
    archived: !!room.archived,
    isDefault: !!room.default,
    favorite: !!room.favorite,
    featured: !!room.featured,
    roomTopic: room.topic ?? '',
    roomDescription: room.description ?? '',
    roomAnnouncement: room.announcement ?? '',
    roomAvatar: undefined
});

export function EditRoomContextBar({ rid }) {
    const canViewRoomAdministration = usePermission('view-room-administration');
    return canViewRoomAdministration ? (
        <EditRoomWithData rid={rid} />
    ) : (
        <NotAuthorizedPage />
    );
}

function EditRoomWithData({ rid }) {
    const {
        value: data = {},
        phase: state,
        error,
        reload
    } = useEndpointData(
        'rooms.adminRooms.getRoom',
        useMemo(() => ({ rid }), [rid])
    );

    if (state === AsyncStatePhase.LOADING) {
        return (
            <Box w='full' pb='x24'>
                <Skeleton mbe='x4' />
                <Skeleton mbe='x8' />
                <Skeleton mbe='x4' />
                <Skeleton mbe='x8' />
                <Skeleton mbe='x4' />
                <Skeleton mbe='x8' />
            </Box>
        );
    }

    if (state === AsyncStatePhase.REJECTED) {
        return error.message;
    }

    return <EditRoom room={{ type: data.t, ...data }} onChange={reload} />;
}

function EditRoom({ room, onChange }) {
    const t = useTranslation();

    const [deleted, setDeleted] = useState(false);

    const setModal = useSetModal();
    const roomNameRegex = new RegExp(
        useSetting('UTF8_Channel_Names_Validation')
    );

    const [saveOnlyNewData, setSaveData] = useState({});

    const onChangeRoom = useCallback(({ initialValue, value, key }) => {
        const current = saveOnlyNewData;
        if (JSON.stringify(initialValue) !== JSON.stringify(value)) {
            current[key] = value;
        } else {
            delete current[key];
        }
        setSaveData(current);
    }, []);

    const { values, handlers, hasUnsavedChanges, reset, commit } = useForm(
        getInitialValues(room),
        onChangeRoom
    );

    const [
        canViewName,
        canViewTopic,
        canViewAnnouncement,
        canViewArchived,
        canViewDescription,
        canViewType,
        canViewReadOnly
    ] = useMemo(() => {
        const isAllowed = roomTypes.getConfig(room.t).allowRoomSettingChange;
        return [
            isAllowed(room, RoomSettingsEnum.NAME),
            isAllowed(room, RoomSettingsEnum.TOPIC),
            isAllowed(room, RoomSettingsEnum.ANNOUNCEMENT),
            isAllowed(room, RoomSettingsEnum.ARCHIVE_OR_UNARCHIVE),
            isAllowed(room, RoomSettingsEnum.DESCRIPTION),
            isAllowed(room, RoomSettingsEnum.TYPE),
            isAllowed(room, RoomSettingsEnum.READ_ONLY)
        ];
    }, [room]);

    const {
        roomName,
        roomType,
        readOnly,
        archived,
        isDefault,
        favorite,
        featured,
        roomTopic,
        roomAvatar,
        roomDescription,
        roomAnnouncement
    } = values;

    const {
        handleIsDefault,
        handleFavorite,
        handleFeatured,
        handleRoomName,
        handleRoomType,
        handleReadOnly,
        handleArchived,
        handleRoomAvatar,
        handleRoomTopic,
        handleRoomDescription,
        handleRoomAnnouncement
    } = handlers;

    const handleNameChange = useMutableCallback(e => {
        const { value } = e.currentTarget;
        handleRoomName(value.match(roomNameRegex)?.[0] ?? '');
    });

    const changeArchivation = archived !== !!room.archived;

    const canDelete = usePermission(`delete-${room.t}`);

    const archiveSelector = room.archived ? 'unarchive' : 'archive';
    const archiveMessage = room.archived
        ? 'Room_has_been_unarchived'
        : 'Room_has_been_archived';

    const saveAction = useEndpointActionExperimental(
        'POST',
        'rooms.saveRoomSettings',
        t('Room_updated_successfully')
    );
    const archiveAction = useEndpointActionExperimental(
        'POST',
        'rooms.changeArchivationState',
        t(archiveMessage)
    );

    const handleSave = useMutableCallback(async () => {
        const { hideSysMes, ...data } = saveOnlyNewData;
        delete data.archived;
        const save = () =>
            saveAction({
                rid: room._id,
                ...data,
                ...((data.systemMessages || !hideSysMes) && {
                    systemMessages: hideSysMes ? systemMessages : []
                })
            });

        const archive = () =>
            archiveAction({ rid: room._id, action: archiveSelector });

        await Promise.all(
            [
                hasUnsavedChanges && save(),
                changeArchivation && archive()
            ].filter(Boolean)
        );
        commit();
        onChange();
    });

    const changeRoomType = useMutableCallback(() => {
        handleRoomType(roomType === 'p' ? 'c' : 'p');
    });

    const deleteRoom = useMethod('eraseRoom');

    const handleDelete = useMutableCallback(() => {
        const onCancel = () => setModal(undefined);
        const onConfirm = async () => {
            await deleteRoom(room._id);
            onCancel();
            setDeleted(true);
        };

        setModal(
            <DeleteChannelWarning onConfirm={onConfirm} onCancel={onCancel} />
        );
    });

    const isArchiveEnabled = useSetting('Enable_Rooms_Archive');

    return (
        <VerticalBar.ScrollableContent
            is='form'
            onSubmit={useMutableCallback(e => e.preventDefault())}
        >
            {deleted && (
                <Callout
                    type='danger'
                    title={t('Room_has_been_deleted')}
                ></Callout>
            )}
            {room.t !== 'd' && (
                <Box pbe='x24' display='flex' justifyContent='center'>
                    <RoomAvatarEditor
                        roomAvatar={roomAvatar}
                        room={room}
                        onChangeAvatar={handleRoomAvatar}
                    />
                </Box>
            )}
            <Field>
                <Field.Label>{t('Name')}</Field.Label>
                <Field.Row>
                    <TextInput
                        disabled={deleted || !canViewName}
                        value={roomName}
                        onChange={handleNameChange}
                        flexGrow={1}
                    />
                </Field.Row>
            </Field>
            {room.t !== 'd' && (
                <>
                    <Field>
                        <Field.Label>{t('Owner')}</Field.Label>
                        <Field.Row>
                            <Box fontScale='p1'>{room.u?.username}</Box>
                        </Field.Row>
                    </Field>
                    {canViewDescription && (
                        <Field>
                            <Field.Label>{t('Description')}</Field.Label>
                            <Field.Row>
                                <TextAreaInput
                                    rows={2}
                                    disabled={deleted}
                                    value={roomDescription}
                                    onChange={handleRoomDescription}
                                    flexGrow={1}
                                />
                            </Field.Row>
                        </Field>
                    )}
                    {canViewAnnouncement && (
                        <Field>
                            <Field.Label>{t('Announcement')}</Field.Label>
                            <Field.Row>
                                <TextAreaInput
                                    rows={2}
                                    disabled={deleted}
                                    value={roomAnnouncement}
                                    onChange={handleRoomAnnouncement}
                                    flexGrow={1}
                                />
                            </Field.Row>
                        </Field>
                    )}
                    {canViewTopic && (
                        <Field>
                            <Field.Label>{t('Topic')}</Field.Label>
                            <Field.Row>
                                <TextAreaInput
                                    rows={2}
                                    disabled={deleted}
                                    value={roomTopic}
                                    onChange={handleRoomTopic}
                                    flexGrow={1}
                                />
                            </Field.Row>
                        </Field>
                    )}
                    {canViewType && (
                        <Field>
                            <Field.Row>
                                <Field.Label>{t('Private')}</Field.Label>
                                <ToggleSwitch
                                    disabled={deleted}
                                    checked={roomType === 'p'}
                                    onChange={changeRoomType}
                                />
                            </Field.Row>
                            <Field.Hint>
                                {t(
                                    'Just_invited_people_can_access_this_channel'
                                )}
                            </Field.Hint>
                        </Field>
                    )}
                    {canViewReadOnly && (
                        <Field>
                            <Field.Row>
                                <Box
                                    display='flex'
                                    flexDirection='row'
                                    justifyContent='space-between'
                                    flexGrow={1}
                                >
                                    <Field.Label>{t('Read_only')}</Field.Label>
                                    <ToggleSwitch
                                        disabled={deleted}
                                        checked={readOnly}
                                        onChange={handleReadOnly}
                                    />
                                </Box>
                            </Field.Row>
                            <Field.Hint>
                                {t(
                                    'Only_authorized_users_can_write_new_messages'
                                )}
                            </Field.Hint>
                        </Field>
                    )}
                    {canViewArchived && isArchiveEnabled && (
                        <Field>
                            <Field.Row>
                                <Box
                                    display='flex'
                                    flexDirection='row'
                                    justifyContent='space-between'
                                    flexGrow={1}
                                >
                                    <Field.Label>{t('Archived')}</Field.Label>
                                    <ToggleSwitch
                                        disabled={deleted}
                                        checked={archived}
                                        onChange={handleArchived}
                                    />
                                </Box>
                            </Field.Row>
                        </Field>
                    )}
                </>
            )}
            <Field>
                <Field.Row>
                    <Box
                        display='flex'
                        flexDirection='row'
                        justifyContent='space-between'
                        flexGrow={1}
                    >
                        <Field.Label>{t('Default')}</Field.Label>
                        <ToggleSwitch
                            disabled={deleted}
                            checked={isDefault}
                            onChange={handleIsDefault}
                        />
                    </Box>
                </Field.Row>
            </Field>
            <Field>
                <Field.Row>
                    <Box
                        display='flex'
                        flexDirection='row'
                        justifyContent='space-between'
                        flexGrow={1}
                    >
                        <Field.Label>{t('Favorite')}</Field.Label>
                        <ToggleSwitch
                            disabled={deleted}
                            checked={favorite}
                            onChange={handleFavorite}
                        />
                    </Box>
                </Field.Row>
            </Field>
            <Field>
                <Field.Row>
                    <Box
                        display='flex'
                        flexDirection='row'
                        justifyContent='space-between'
                        flexGrow={1}
                    >
                        <Field.Label>{t('Featured')}</Field.Label>
                        <ToggleSwitch
                            disabled={deleted}
                            checked={featured}
                            onChange={handleFeatured}
                        />
                    </Box>
                </Field.Row>
            </Field>
            <Field>
                <Field.Row>
                    <Box
                        display='flex'
                        flexDirection='row'
                        justifyContent='space-between'
                        w='full'
                    >
                        <ButtonGroup stretch flexGrow={1}>
                            <Button
                                type='reset'
                                disabled={!hasUnsavedChanges || deleted}
                                onClick={reset}
                            >
                                {t('Reset')}
                            </Button>
                            <Button
                                flexGrow={1}
                                disabled={
                                    !hasUnsavedChanges || !roomName || deleted
                                }
                                onClick={handleSave}
                            >
                                {t('Save')}
                            </Button>
                        </ButtonGroup>
                    </Box>
                </Field.Row>
            </Field>
            <Field>
                <Field.Row>
                    <Button
                        primary
                        flexGrow={1}
                        danger
                        disabled={deleted || !canDelete}
                        onClick={handleDelete}
                    >
                        <Icon name='trash' size='x16' />
                        {t('Delete')}
                    </Button>
                </Field.Row>
            </Field>
        </VerticalBar.ScrollableContent>
    );
}
