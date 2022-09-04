import { settings } from '../../../settings/server';
import { escapeRegExp } from '../../../../lib/escapeRegExp';

export const buildQueryOfFindByUsers = (
    isAllActivated: boolean,
    searchTerm: string,
    exceptions = [],
    forcedSearchFields: string[] | undefined,
    extraQuery = [],
    { startsWith = false, endsWith = false } = {}
) => {
    if (!Array.isArray(exceptions)) {
        exceptions = [exceptions];
    }

    const termRegex = new RegExp(
        (startsWith ? '^' : '') +
            escapeRegExp(searchTerm) +
            (endsWith ? '$' : ''),
        'i'
    );

    const searchFields =
        forcedSearchFields ||
        (settings.get('Accounts_SearchFields') as string).trim().split(',');

    const orStatement = searchFields.reduce(
        (accumulator: Record<string, RegExp>[], element) => {
            accumulator.push({ [element.trim()]: termRegex });
            return accumulator;
        },
        []
    );

    const orExtraQuery = searchTerm ? { $or: orStatement } : {};

    return {
        $and: [
            {
                active: { $in: [isAllActivated, true] },
                username: { $exists: true, $nin: exceptions },
                ...orExtraQuery
            },
            ...extraQuery
        ]
    };
};
