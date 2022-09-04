import { Box } from '@rocket.chat/fuselage';
import React from 'react';
import getFileIcon from './FileIcons';

enum MimeTypes {
    Excel = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    Word = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    PowerPoint = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    Pdf = 'application/pdf',
    Audio = 'audio',
    Video = 'video',
    Zip = 'application/x-zip-compressed'
}

type IconProps = {
    type: string;
    name: string;
};

const conditionToIcon = {
    word: (type: string, name: string) =>
        getFileIcon(
            type.includes(MimeTypes.Word) || name.endsWith('.docx'),
            'word'
        ),
    excel: (type: string, name: string) =>
        getFileIcon(
            type.includes(MimeTypes.Excel) || name.endsWith('.xlsx'),
            'excel'
        ),
    powerPoint: (type: string, name: string) =>
        getFileIcon(
            type.includes(MimeTypes.PowerPoint) || name.endsWith('.pptx'),
            'powerPoint'
        ),
    audio: (type: string, name: string) =>
        getFileIcon(type.includes(MimeTypes.Audio), 'audio'),
    video: (type: string, name: string) =>
        getFileIcon(type.includes(MimeTypes.Video), 'video'),
    pdf: (type: string, name: string) =>
        getFileIcon(type === MimeTypes.Pdf, 'pdf'),
    zip: (type: string, name: string) =>
        getFileIcon(type === MimeTypes.Zip, 'zip'),
    document: () => getFileIcon(true, 'document')
};

const renderIcon = (type: string, name: string) => {
    for (const key in conditionToIcon) {
        const icon = conditionToIcon[key](type, name);
        if (icon) {
            return icon;
        }
    }
};

export default React.memo(({ type, name }: IconProps) => {
    return (
        <Box
            is='span'
            display='flex'
            alignItems='center'
            justifyContent='center'
            w='48px'
            h='48px'
        >
            {renderIcon(type, name)}
        </Box>
    );
});
