import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import styles from './TableSearchBar.module.css';
import { FaSearch, FaTimes, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const TableSearchBar = forwardRef(({ 
    columns, 
    onSearch,
    onColumnFilterChange,
    showClearAllButton = true,
}, ref) => {
    const defaultColumnFilters = columns.reduce((acc, col) => ({
        ...acc,
        [col.key]: col.type === 'checkbox' ? col.options : 
                   col.key === 'status' ? col.options : ''
    }), {});

    

    const [globalSearch, setGlobalSearch] = useState('');
    const [columnFilters, setColumnFilters] = useState(
        defaultColumnFilters
    );

    const handleGlobalSearch = (value) => {
        setGlobalSearch(value);
        onSearch(value);
    };

    const handleColumnFilter = (column, value) => {
        const newFilters = {
            ...columnFilters,
            [column]: value
        };
        setColumnFilters(newFilters);
        onColumnFilterChange(newFilters);
    };

    const clearGlobalSearch = () => {
        setGlobalSearch('');
        onSearch('');
    };

    const clearColumnFilter = (column) => {
        const newFilters = {
            ...columnFilters,
            [column]: ''
        };
        setColumnFilters(newFilters);
        onColumnFilterChange(newFilters);
    };

    const clearAllFilters = () => {
        setGlobalSearch('');
        setColumnFilters(defaultColumnFilters);
        onSearch('');
        onColumnFilterChange(defaultColumnFilters);
    };

    const [hasActiveFilters, setHasActiveFilters] = useState(
        globalSearch !== '' || columnFilters['status']?.length !== defaultColumnFilters['status']?.length
    );

    useEffect(() => {
        setHasActiveFilters(globalSearch !== '' || columnFilters['status']?.length !== defaultColumnFilters['status']?.length)
    }, [globalSearch, columnFilters])

    // Expose reset method to parent component
    useImperativeHandle(ref, () => ({
        reset: () => {
            setGlobalSearch('');
            setColumnFilters(defaultColumnFilters);
            onSearch('');
            onColumnFilterChange(defaultColumnFilters);
        }
    }));

    const [expandedDateFilters, setExpandedDateFilters] = useState({});

    const toggleDateFilter = (columnKey) => {
        setExpandedDateFilters(prev => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    return (
        <div className={styles.searchContainer}>
            <div className={styles.searchHeader}>
                <div className={`${styles.globalSearch} ${globalSearch ? styles.hasValue : ''}`}>
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search across all fields..."
                        value={globalSearch}
                        className={globalSearch ? styles.hasValue : ''}
                        onChange={(e) => handleGlobalSearch(e.target.value)}
                    />
                    {globalSearch && (
                        <button 
                            className={styles.clearButton}
                            onClick={clearGlobalSearch}
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>
                {hasActiveFilters && (showClearAllButton === true) && (
                    <button 
                        className={styles.clearAllButton}
                        onClick={clearAllFilters}
                        id="clear-all-filters"
                    >
                        <FaTrash /> Clear All Filters
                    </button>
                )}
            </div>

            {/* Column Filters */}
            <div className={styles.columnFilters}>
                {columns.map(column => column.type !== 'checkbox' && column.type !== 'datetime' && (                    
                    <div key={column.key} className={styles.filterField}>
                        {column?.label && column.showLabel && (
                            <span className={`${styles.columnLabel} ${column.labelPadding ? styles[`padding${column.labelPadding}`] : ''}`}>
                                {column.label}
                            </span>
                        )}
                        {column.type === 'select' ? (
                            <div className={styles.filterInputWrapper}>
                                <select
                                    value={columnFilters[column.key]}
                                    onChange={(e) => handleColumnFilter(column.key, e.target.value)}
                                    className={columnFilters[column.key] ? styles.hasValue : ''}
                                >
                                    <option value="">{`${column.label}`}</option>
                                    {column.options.map(option => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                {columnFilters[column.key] && (
                                    <button 
                                        className={styles.clearButton}
                                        style={{right: "16px"}}
                                        onClick={() => clearColumnFilter(column.key)}
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className={styles.filterInputWrapper}>
                                <input
                                    type="text"
                                    placeholder={`Filter ${column.label}`}
                                    value={columnFilters[column.key]}
                                    onChange={(e) => handleColumnFilter(column.key, e.target.value)}
                                    className={columnFilters[column.key] ? styles.hasValue : ''}
                                />
                                {columnFilters[column.key] && (
                                    <button 
                                        className={styles.clearButton}
                                        onClick={() => clearColumnFilter(column.key)}
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* DateTime Filters */}
            {columns.map(column => column.type === 'datetime' && (
                <div className={styles.dateTimeFilters} key={column.key}>                
                    <div className={styles.filterField}>
                        <div className={styles.dateTimeHeader} onClick={() => toggleDateFilter(column.key)}>
                            {column?.label && column.showLabel && (
                                <span className={`${styles.columnLabel} ${column.labelPadding ? styles[`padding${column.labelPadding}`] : ''}`}>
                                    {column.label}
                                </span>
                            )}
                            {expandedDateFilters[column.key] ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                    </div>                
                    {expandedDateFilters[column.key] && (
                        <div className={styles.filterInputWrapper}>
                            <div className={styles.dateRangeContainer}>
                                <div className={styles.dateTimeInput}>
                                    <label>From:</label>
                                    <input
                                        type="datetime-local"
                                        value={columnFilters[column.key]?.start || ''}
                                        onChange={(e) => handleColumnFilter(column.key, {
                                            ...columnFilters[column.key],
                                            start: e.target.value
                                        })}
                                    />
                                </div>
                                <div className={styles.dateTimeInput}>
                                    <label>To:</label>
                                    <input
                                        type="datetime-local"
                                        value={columnFilters[column.key]?.end || ''}
                                        onChange={(e) => handleColumnFilter(column.key, {
                                            ...columnFilters[column.key],
                                            end: e.target.value
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            <div className={styles.statusFilter}>
                {columns.map(column => column.type === 'checkbox' && (
                    // <div key={column.key} className={`${styles.statusWrapper} ${(columnFilters[column.key]) ? styles.active : ''}`}>
                    <div key={column.key} className={`${styles.statusWrapper}`}>
                        <div className={styles.statusHeader}>
                            <span className={styles.columnLabel}>{column.label}</span>
                            <div className={styles.statusButtons}>
                                <button
                                    className={`${styles.statusToggleButton} ${columnFilters[column.key]?.length === column.options.length ? styles.active : ''}`}
                                    onClick={() => handleColumnFilter(column.key, [...column.options])}
                                    disabled={columnFilters[column.key]?.length === column.options.length}
                                >
                                    Select All
                                </button>
                                <button
                                    className={`${styles.statusToggleButton} ${(!columnFilters[column.key] || columnFilters[column.key].length === 0) ? styles.active : ''}`}
                                    onClick={() => handleColumnFilter(column.key, [])}
                                    disabled={!columnFilters[column.key] || columnFilters[column.key].length === 0}
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                        <div className={styles.checkboxWrapper}>
                            {column.options.map(option => (
                                <label 
                                    key={option} 
                                    className={styles.checkboxField} 
                                    htmlFor={`checkbox-${option}`}
                                >
                                    <input
                                        type="checkbox"
                                        id={`checkbox-${option}`}
                                        checked={columnFilters[column.key]?.includes(option)}
                                        onChange={(e) => {
                                            
                                            const newValue = e.target.checked
                                                ? [...(columnFilters[column.key] || []), option]
                                                : columnFilters[column.key].filter(opt => opt !== option);
                                            handleColumnFilter(column.key, newValue);
                                            
                                        }}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default TableSearchBar;

const TimeSlider = ({ value, onChange, label }) => {
    const [startTime, setStartTime] = useState(value?.start || "00:00");
    const [endTime, setEndTime] = useState(value?.end || "23:59");

    const handleTimeChange = (type, newValue) => {
        let newStartTime = type === 'start' ? newValue : startTime;
        let newEndTime = type === 'end' ? newValue : endTime;

        // Ensure end time is not before start time
        if (newEndTime < newStartTime) {
            if (type === 'start') {
                newEndTime = newValue;
            } else {
                newStartTime = newValue;
            }
        }

        setStartTime(newStartTime);
        setEndTime(newEndTime);
        onChange({ start: newStartTime, end: newEndTime });
    };

    return (
        <div className={styles.timeSliderContainer}>
            <span className={styles.columnLabel}>{label}</span>
            <div className={styles.timeInputs}>
                <div className={styles.timeInput}>
                    <label>From:</label>
                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => handleTimeChange('start', e.target.value)}
                    />
                </div>
                <div className={styles.timeInput}>
                    <label>To:</label>
                    <input
                        type="time"
                        value={endTime}
                        onChange={(e) => handleTimeChange('end', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};
