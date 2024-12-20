import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import RefreshButton from '../buttons/RefreshButton/RefreshButton';
import styles from './PaginationControls.module.css';

export default function PaginationControls({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    pageSizeOptions,
    onPageChange,
    onPageSizeChange,
    pageInput,
    onPageInputChange,
    onPageInputBlur,
    onRefresh,
    loadState,
}) {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    return (
        <div className={styles.paginationContainer}>
            <div className={styles.paginationInfo}>
                Showing {startIndex + 1}-{endIndex} of {totalItems} items
            </div>

            <div className={styles.controlsWrapper}>
                <div className={styles.paginationControls}>
                    <button
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                    >
                        First
                    </button>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                    >
                        <FaChevronLeft />
                    </button>
                    <span className={styles.pageInfo}>
                        Page{' '}
                        <input
                            type="number"
                            min={1}
                            max={totalPages}
                            value={pageInput}
                            onChange={onPageInputChange}
                            onBlur={onPageInputBlur}
                            className={styles.pageInput}
                        />
                        {' '}of {totalPages}
                    </span>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={styles.paginationButton}
                    >
                        <FaChevronRight />
                    </button>
                    <button
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className={styles.paginationButton}
                    >
                        Last
                    </button>
                </div>

                <div className={styles.pageSize}>
                    <select 
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(e.target.value)}
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>
                                {size} per page
                            </option>
                        ))}
                    </select>
                </div>
                
                <RefreshButton onRefresh={onRefresh} loadState={loadState} />
            </div>
        </div>
    );
}
