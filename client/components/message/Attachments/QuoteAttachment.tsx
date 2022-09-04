import { Box } from '@rocket.chat/fuselage';
import React, { FC } from 'react';
import { css } from '@rocket.chat/css-in-js';
import colors from '@rocket.chat/fuselage-tokens/colors';
import { Attachment, AttachmentPropsBase } from './Attachment';
import { useTimeAgo } from '../../../hooks/useTimeAgo';
import MarkdownText from '../../MarkdownText';
import { Messages, Rooms } from '../../../../app/models/client';
import { settings } from '../../../../app/settings/client';
import { RoomTypeToLabel } from '../../../../app/utils/lib/RoomTypeConfig';
import { renderMessageBody } from '../../../lib/renderMessageBody';
import Attachments from '.';

export type QuoteAttachmentProps = {
    author_icon: string;
    author_name: string;
    attachments?: Array<QuoteAttachmentProps>;
    type: string;
    msgId: string;
    rid: string;
    ts: string;
    text: string;
} & AttachmentPropsBase;

const hover = css`
    &:hover,
    &:focus {
        .rcx-attachment__details {
            background: ${colors.n200} !important;
            border-color: ${colors.n300} !important;
            border-inline-start-color: ${colors.n600} !important;
        }
    }
`;

const siteUrl = () => {
    const urlFromSettings = settings.get('Site_Url');
    return urlFromSettings.endsWith('/')
        ? urlFromSettings
        : `${urlFromSettings}/`;
};

export const QuoteAttachment: FC<QuoteAttachmentProps> = ({
    author_icon: url,
    author_name: authorName,
    attachments: innerAttachments,
    msgId,
    rid,
    ts,
    text
}) => {
    const format = useTimeAgo();
    const message = Messages.findOne({ _id: msgId }) ?? {
        ts,
        u: { name: authorName },
        msg: text
    };
    const {
        u: { name }
    } = message;
    const { t, name: roomName } = Rooms.findOne({ _id: rid }) ?? {};

    const messageLink = `${siteUrl()}${RoomTypeToLabel[t]}/${
        roomName ?? rid
    }?msg=${msgId}`;

    const cleanName = name?.split('/')?.pop();

    const adjustedText = renderMessageBody(message);

    return (
        <>
            <Attachment.Content
                className={hover}
                width='full'
                is='a'
                href={messageLink}
            >
                <Attachment.Details
                    is='blockquote'
                    borderRadius='x2'
                    borderWidth='x2'
                    borderStyle='solid'
                    borderColor='neutral-200'
                    borderInlineStartColor='neutral-600'
                >
                    <Attachment.Author>
                        <Attachment.AuthorAvatar url={url} />
                        <Attachment.AuthorName>
                            {cleanName}
                        </Attachment.AuthorName>
                        <Box fontScale='c1'>{format(ts)}</Box>
                    </Attachment.Author>
                    <MarkdownText mb='neg-x16' content={adjustedText} />
                    {innerAttachments && (
                        <Attachment.Inner>
                            <Attachments attachments={innerAttachments} />
                        </Attachment.Inner>
                    )}
                </Attachment.Details>
            </Attachment.Content>
        </>
    );
};
