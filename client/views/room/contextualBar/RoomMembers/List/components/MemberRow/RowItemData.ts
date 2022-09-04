import React from 'react';
import memoize from 'memoize-one';

import { TranslationContextValue } from '../../../../../../../contexts/TranslationContext';
import { IUser } from '../../../../../../../../definition/IUser';

export const createMemberItemData = memoize(
    (
        items: RowItemData['items'],
        onClickView: RowItemData['onClickView'],
        rid: RowItemData['rid'],
        t: RowItemData['t'],
        reload: RowItemData['reload']
    ) => ({
        items,
        onClickView,
        rid,
        t,
        reload
    })
);

export type RowItemData = {
    items: IUser[];
    rid: string;
    reload: () => void;
    t: TranslationContextValue['translate'];
    onClickView: (e: React.MouseEvent<HTMLElement>) => void;
};
