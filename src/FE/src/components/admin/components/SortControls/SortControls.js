import React from 'react';
import styles from './SortControls.module.css';

const SortControls = ({ columns, sortConfig, onSort }) => {
    return (
        <div className={styles.sortControls}>
            <select 
                className={styles.sortSelect}
                value={sortConfig.key || ''}
                onChange={(e) => onSort(e.target.value)}
            >
                <option value="">Sort by...</option>
                {columns
                    .filter(col => col.sortable)
                    .map(col => (
                        <option key={col.key} value={col.key}>
                            {col.label}
                        </option>
                    ))
                }
            </select>
            {sortConfig.key && (
                <button 
                    className={styles.directionButton}
                    onClick={() => onSort(sortConfig.key)}
                >
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </button>
            )}
        </div>
    );
};

export default SortControls;
