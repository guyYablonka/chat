import { Box, Icon, Tile } from '@rocket.chat/fuselage';
import React, { FC } from 'react';

export type ContactAttachmentProps = {
    contact_name: string;
    contact_phone_number: number;
};

const CHARS_PER_LINE = 24;

export const ContactAttachment: FC<ContactAttachmentProps> = ({
    contact_name,
    contact_phone_number
}) => (
    <Tile
        elevation='2'
        display='flex'
        flexDirection='row-reverse'
        alignItems='center'
        borderRadius='0.5rem'
        margin='0.5rem'
        rcx-contact-attachment
    >
        <Icon size='x36' name='contact' marginInlineStart='x16' />
        <Box marginInlineEnd='auto'>
            <Box width={`${Math.min(contact_name.length, CHARS_PER_LINE)}ch`}>
                {contact_name}
            </Box>
            <span>{contact_phone_number}</span>
        </Box>
    </Tile>
);
