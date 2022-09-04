import React, { forwardRef } from 'react';
import { ScrollerProps } from 'react-virtuoso';
import VirtuosoScroller from './VirtuosoScroller';
import {
    isBrowserChrome,
    isVersionBiggerThan
} from '../../app/ui-utils/client/lib/browserSupport';

const changeViewStyleByChromeVersion = (style: React.CSSProperties) => {
    if (!isBrowserChrome() || isVersionBiggerThan(79)) {
        style.marginRight = 0;
    }

    return style;
};

const ScrollerWithCustomProps = forwardRef<HTMLDivElement, ScrollerProps>(
    function ScrollerWithCustomProps(props, ref) {
        return (
            <VirtuosoScroller
                {...props}
                ref={ref}
                renderView={({ style, ...props }) => (
                    <div
                        {...props}
                        style={{ ...changeViewStyleByChromeVersion(style) }}
                    />
                )}
                renderTrackHorizontal={(props: Record<string, unknown>) => (
                    <div
                        {...props}
                        style={{ display: 'none' }}
                        className='track-horizontal'
                    />
                )}
            />
        );
    }
);

export default ScrollerWithCustomProps;
