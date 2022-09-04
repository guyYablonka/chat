import React, { useMemo } from 'react';
import { Avatar, Tile, Box, Chevron } from '@rocket.chat/fuselage';
import FileItemIcon from '../../RoomFiles/components/FileItemIcon';
import { useFileList } from '../../RoomFiles/hooks/useFileList';
import { useTranslation } from '/client/contexts/TranslationContext';
import { AsyncStatePhase } from '/client/lib/asyncState';

type ContainerProps = {
    rid: string;
    roomType: string;
    onTitleClick: (tab: string) => void;
};

type PresentionalProps = {
    items: FileItem[] | undefined;
    state: AsyncStatePhase;
    onTitleClick: (tab: string) => void;
    t: {
        (key: string, ...replaces: unknown[]): string;
        has: (key: string) => boolean;
    };
};

type FileItem = {
    typeGroup: string;
    url: string;
    type: string;
    name: string;
};

export default ({ rid, roomType, onTitleClick, ...props }: ContainerProps) => {
    const t = useTranslation();

    const query = useMemo(
        () => ({
            roomId: rid,
            sort: JSON.stringify({ uploadedAt: -1 }),
            count: 5
        }),
        [rid]
    );

    const { value: data, phase: state } = useFileList(roomType, query);

    return (
        <FilesList
            t={t}
            onTitleClick={onTitleClick}
            items={data?.files}
            state={state}
            {...props}
        />
    );
};

const FilesList = React.memo(
    ({ items, state, onTitleClick, t, ...props }: PresentionalProps) => (
        <Tile elevation='2' flexDirection='column' display='flex' {...props}>
            <Box
                is='label'
                onClick={() => onTitleClick('uploaded-files-list')}
                margin='0 0 5%'
                display='flex'
                justifyContent='space-between'
            >
                <Box is='h2'>{t('Files_List')}</Box>
                <Chevron right is='a' color='black' />
            </Box>
            <Box
                flexDirection='row'
                display='flex'
                justifyContent='space-around'
            >
                {items?.length ? (
                    items?.map(
                        ({ typeGroup, url, type, name }: FileItem, index) => (
                            <Box
                                is='a'
                                {...(typeGroup === 'image' && {
                                    className: 'gallery-item'
                                })}
                                key={index}
                                href={url}
                                title={name}
                                download
                                rel='noopener noreferrer'
                                target='_blank'
                            >
                                {typeGroup === 'image' ? (
                                    <Avatar size='x48' url={url} />
                                ) : (
                                    <FileItemIcon type={type} name={name} />
                                )}
                            </Box>
                        )
                    )
                ) : (
                    <Box is='span' mis='0.5vw'>
                        {t('Files_List_Description')}
                    </Box>
                )}
            </Box>
        </Tile>
    ),
    (prevProps, props) =>
        prevProps.items?.length === props.items?.length &&
        prevProps.state === props.state
);
