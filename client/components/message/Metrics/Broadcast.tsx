import React, { FC } from 'react';

import { useTranslation } from '../../../contexts/TranslationContext';
import { Reply, Content } from '..';
import { useBlockRendered } from '../hooks/useBlockRendered';

type BroadcastOptions = {
    username: string;
    mid: string;
    replyBroadcast: () => void;
};

const BroadcastMetric: FC<BroadcastOptions> = ({
    username,
    mid,
    replyBroadcast
}) => {
    const t = useTranslation();
    const { className, ref } = useBlockRendered();

    return (
        <Content>
            <div className={className} ref={ref as any} />
            <Reply
                data-username={username}
                data-mid={mid}
                onClick={replyBroadcast}
            >
                {t('Reply')}
            </Reply>
        </Content>
    );
};

export default BroadcastMetric;
