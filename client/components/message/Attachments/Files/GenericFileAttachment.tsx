import React, { FC } from 'react';

import { Attachment, AttachmentPropsBase } from '../Attachment';
import MarkdownText from '../../../MarkdownText';
import { FileProp } from '..';

export type GenericFileAttachmentProps = {
    file?: FileProp;
} & AttachmentPropsBase;

export const GenericFileAttachment: FC<GenericFileAttachmentProps> = ({
    title,
    description,
    title_link: link,
    title_link_download: hasDownload,
    file: { size } = {}
}) => (
    <Attachment>
        <Attachment.Row>
            <Attachment.Title
                {...(hasDownload &&
                    link && {
                        is: 'a',
                        href: link,
                        color: undefined,
                        target: '_blank',
                        download: title
                    })}
            >
                {title}
            </Attachment.Title>
            {size && <Attachment.Size size={size} />}
            {hasDownload && link && (
                <Attachment.Download title={title} href={link} />
            )}
        </Attachment.Row>
        {description && (
            <MarkdownText withRichContent={false} content={description} />
        )}
    </Attachment>
);
