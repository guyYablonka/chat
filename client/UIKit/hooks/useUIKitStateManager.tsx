import { useEffect, useState } from 'react';
import { useSafely } from '@rocket.chat/fuselage-hooks';

import {
    isErrorType,
    UIKitUserInteractionResult,
    UiKitPayload
} from '../../../definition/UIKit';
import * as ActionManager from '../../../app/ui-message/client/ActionManager';

const useUIKitStateManager = <S extends UiKitPayload>(initialState: S): S => {
    const [state, setState] = useSafely(useState<S>(initialState));

    const { viewId } = state;

    useEffect(() => {
        const handleUpdate = ({
            ...data
        }: UIKitUserInteractionResult): void => {
            if (isErrorType(data)) {
                const { errors } = data;
                setState(state => ({ ...state, errors }));
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { type, ...rest } = data;
            setState(rest as any);
        };

        ActionManager.on(viewId, handleUpdate);

        return (): void => {
            ActionManager.off(viewId, handleUpdate);
        };
    }, [setState, viewId]);

    return state;
};

export { useUIKitStateManager };
