import React, { useMemo } from 'react';
import { PaginationProps, Box, Chevron } from '@rocket.chat/fuselage';
import {
    getPaginationLayout,
    PAGINATION_SEPERATOR
} from './functions/getPaginationLayout';

export const MembersPagination = ({
    count,
    current = 0,
    itemsPerPage = 50,
    onSetCurrent,
    fontSize = '16px',
    ...props
}: PaginationProps) => {
    const currentPage = Math.floor(current / itemsPerPage);
    const pages = Math.ceil(count / itemsPerPage);
    const displayedPages = useMemo(
        () => getPaginationLayout(pages, currentPage),
        [pages, currentPage]
    );

    const handleSetPageLinkClick = (page: number) => () => {
        onSetCurrent?.(page * itemsPerPage);
    };

    return (
        <Box is='nav' justifyContent={'center'} rcx-pagination {...props}>
            {pages > 1 && (
                <Box is='ol' rcx-pagination__list>
                    <Box is='li' rcx-pagination__list-item>
                        <Chevron
                            is='button'
                            rcx-pagination__back
                            disabled={currentPage === 0}
                            onClick={handleSetPageLinkClick(currentPage - 1)}
                            left
                            fontSize={fontSize}
                        />
                    </Box>
                    {displayedPages.map((page, i) => (
                        <Box
                            fontSize={fontSize}
                            key={i}
                            is='li'
                            rcx-pagination__list-item
                        >
                            {page === PAGINATION_SEPERATOR ? (
                                page
                            ) : (
                                <Box
                                    fontSize={fontSize}
                                    is='button'
                                    rcx-pagination__link
                                    disabled={currentPage === page}
                                    onClick={handleSetPageLinkClick(page)}
                                >
                                    {Number(page) + 1}
                                </Box>
                            )}
                        </Box>
                    ))}
                    <Box is='li' rcx-pagination__list-item>
                        <Chevron
                            is='button'
                            rcx-pagination__forward
                            disabled={currentPage === pages - 1}
                            onClick={handleSetPageLinkClick(currentPage + 1)}
                            right
                            fontSize={fontSize}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
};
