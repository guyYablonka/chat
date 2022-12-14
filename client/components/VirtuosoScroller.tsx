import { Scrollbars, ScrollValues } from 'rc-scrollbars';
import React, {
    MutableRefObject,
    CSSProperties,
    useMemo,
    forwardRef,
    ReactNode,
    ReactElement
} from 'react';

const styleDefault = {
    width: '100%',
    height: '100%',
    flexGrow: 1,
    willChange: 'transform',
    overflowY: 'hidden'
};

export type CustomScrollbarsProps = {
    overflowX?: boolean;
    style?: CSSProperties;
    children?: ReactNode;
    onScroll?: (values: ScrollValues) => void;
    renderView?: typeof Scrollbars.defaultProps.renderView;
    renderTrackHorizontal?: typeof Scrollbars.defaultProps.renderTrackHorizontal;
};

const VirtuosoScroller = forwardRef<HTMLElement, CustomScrollbarsProps>(
    function WrappedComponent(
        { children, style, onScroll, overflowX, renderView },
        ref
    ) {
        const scrollbarsStyle = useMemo(
            () => ({ ...style, ...styleDefault }),
            [style]
        ) as CSSProperties;

        return (
            <Scrollbars
                autoHide
                autoHideTimeout={2000}
                autoHideDuration={500}
                style={scrollbarsStyle}
                onScrollFrame={onScroll}
                renderView={renderView}
                renderTrackHorizontal={
                    overflowX
                        ? undefined
                        : (props): ReactElement => (
                              <div
                                  {...props}
                                  className='track-horizontal'
                                  style={{ display: 'none' }}
                              />
                          )
                }
                renderThumbVertical={({ style, ...props }): JSX.Element => (
                    <div
                        {...props}
                        style={{
                            ...style,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '7px',
                            display: 'none'
                        }}
                    />
                )}
                children={children}
                ref={(sRef): void => {
                    if (ref && sRef) {
                        if (typeof ref === 'function') {
                            ref(sRef.view ?? null);
                            return;
                        }

                        (
                            ref as MutableRefObject<HTMLElement | undefined>
                        ).current = sRef.view;
                    }
                }}
            />
        );
    }
);

export default VirtuosoScroller;
