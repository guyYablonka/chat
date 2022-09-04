import { Option, Icon } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React, { useMemo } from 'react';

import { useTranslation } from '../contexts/TranslationContext';
import { useSetting } from '../contexts/SettingsContext';
import { useRoute } from '../contexts/RouterContext';
import { useMethod } from '../contexts/ServerContext';
import { roomTypes, UiTextContext, RoomTypes } from '../../app/utils/client';
import { useToastMessageDispatch } from '../contexts/ToastMessagesContext';
import { useUserSubscription } from '../contexts/UserContext';
import { usePermission } from '../contexts/AuthorizationContext';
import { useSetModal } from '../contexts/ModalContext';
import WarningModal from '../views/admin/apps/WarningModal';
import SetOwnerModal from '../views/room/contextualBar/UserInfo/modals/SetOwnerModal';
import { RoomManager } from '../../app/ui-utils/client';
import { Menu } from '../components/Menu/Menu';

const fields = {
    f: 1,
    t: 1,
    name: 1,
    disableNotifications: 1
};

const RoomMenu = React.memo(
    ({ rid, unread, threadUnread, alert, type, cl, name = '' }) => {
        const t = useTranslation();
        const dispatchToastMessage = useToastMessageDispatch();
        const setModal = useSetModal();

        const closeModal = useMutableCallback(() => setModal());

        const router = useRoute('home');

        const subscription = useUserSubscription(rid, fields);

        const canFavorite = useSetting('Favorite_Rooms');
        const isFavorite =
            (subscription != null ? subscription.f : undefined) != null &&
            subscription.f;

        const hideRoom = useMethod('hideRoom');
        const readMessages = useMethod('readMessages');
        const unreadMessages = useMethod('unreadMessages');
        const toggleFavorite = useMethod('toggleFavorite');
        const leaveRoom = useMethod('leaveRoom');

        const isUnread = alert || unread || threadUnread;

        const canLeaveChannel = usePermission('leave-c');
        const canLeavePrivate = usePermission('leave-p');
        const canHide = type === RoomTypes.DM;

        const canLeave = (() => {
            if (type === RoomTypes.CHANNEL && !canLeaveChannel) {
                return false;
            }
            if (type === RoomTypes.PRIVATE_GROUP && !canLeavePrivate) {
                return false;
            }
            return !((cl != null && !cl) || [RoomTypes.DM, 'l'].includes(type));
        })();

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
                    text={t(warnText, name)}
                    confirmText={t('Leave_room')}
                    close={closeModal}
                    cancel={closeModal}
                    cancelText={t('Cancel')}
                    confirm={leave}
                />
            );
        });

        const handleHide = useMutableCallback(async () => {
            const hide = async () => {
                try {
                    await hideRoom(rid);
                } catch (error) {
                    dispatchToastMessage({ type: 'error', message: error });
                }
                closeModal();
            };

            const warnText = roomTypes
                .getConfig(type)
                .getUiText(UiTextContext.HIDE_WARNING);

            setModal(
                <WarningModal
                    text={t(warnText, name)}
                    confirmText={t('Yes_hide_it')}
                    close={closeModal}
                    cancel={closeModal}
                    cancelText={t('Cancel')}
                    confirm={hide}
                />
            );
        });

        const handleToggleRead = useMutableCallback(async () => {
            try {
                if (isUnread) {
                    await readMessages(rid);
                    return;
                }
                await unreadMessages(null, rid);
                if (subscription == null) {
                    return;
                }
                RoomManager.close(subscription.t + subscription.name);

                router.push({});
            } catch (error) {
                dispatchToastMessage({ type: 'error', message: error });
            }
        });

        const handleToggleFavorite = useMutableCallback(async () => {
            try {
                await toggleFavorite(rid, !isFavorite);
            } catch (error) {
                dispatchToastMessage({ type: 'error', message: error });
            }
        });

        const menuOptions = useMemo(
            () => ({
                ...(canHide && {
                    hideRoom: {
                        label: { label: t('Hide'), icon: 'eye-off' },
                        action: handleHide
                    }
                }),
                toggleRead: {
                    label: {
                        label: isUnread
                            ? t('Mark_as_read')
                            : t('Mark_as_unread'),
                        icon: 'flag'
                    },
                    action: handleToggleRead
                },
                ...(canFavorite && {
                    toggleFavorite: {
                        label: {
                            label: isFavorite ? t('Unpin') : t('Pin'),
                            icon: 'pin',
                            style: !isFavorite
                                ? {
                                      transform: 'rotate(45deg)'
                                  }
                                : null
                        },
                        action: handleToggleFavorite
                    }
                }),
                ...(canLeave && {
                    leaveRoom: {
                        label: { label: t('Leave_room'), icon: 'sign-out' },
                        action: handleLeave
                    }
                })
            }),
            [
                canHide,
                t,
                handleHide,
                isUnread,
                handleToggleRead,
                canFavorite,
                isFavorite,
                handleToggleFavorite,
                canLeave,
                handleLeave
            ]
        );

        return (
            <Menu
                rcx-sidebar-item__menu
                mini
                aria-keyshortcuts='alt'
                tabIndex={-1}
                options={menuOptions}
                renderItem={({ label: { label, icon, style }, ...props }) => (
                    <Option title={label} {...props}>
                        <Icon name={icon} style={style} size={20} />
                        <Option.Content> {label} </Option.Content>
                    </Option>
                )}
            />
        );
    }
);

export default RoomMenu;
