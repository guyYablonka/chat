import { useCallback } from 'react';

import { useMethod } from '../../../../../../contexts/ServerContext';
import { useDataWithLoadMore } from '../../../hooks/useDataWithLoadMore';

export const useGetUsersOfRoom = (params: {
    rid: string;
    debouncedText: string;
    showAll: boolean;
    limitAndSkip: { limit: number; skip: number };
}) => {
    const method = useMethod('getUsersOfRoom');
    return useDataWithLoadMore(
        useCallback(args => method(...args), [method]),
        params
    );
};
