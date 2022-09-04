export const PAGINATION_SEPERATOR = '⋯';

export const getPaginationLayout = (pages: number, currentPage: number) => {
    if (pages <= 7) {
        return Array.from({ length: pages }, (_, i) => i);
    }

    if (currentPage < 5) {
        return [0, 1, 2, 3, 4, PAGINATION_SEPERATOR, pages - 1] as const;
    }

    if (currentPage > pages - 5) {
        return [
            0,
            PAGINATION_SEPERATOR,
            pages - 5,
            pages - 4,
            pages - 3,
            pages - 2,
            pages - 1
        ] as const;
    }

    return [
        0,
        PAGINATION_SEPERATOR,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        PAGINATION_SEPERATOR,
        pages - 1
    ] as const;
};
