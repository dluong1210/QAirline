import React from 'react';
import { useState, useEffect, useRef } from 'react';

import styles from './AdminSchedules.module.css';

import AdminPageTitle from '../../components/PageTitle/AdminPageTitle';
import TableSearchBar from '../../components/TableSearchBar/TableSearchBar';
import { searchFilter } from 'utils/filter/searchFilter';
import { columnFilter } from 'utils/filter/columnFilter';
import LoadingSpinner from 'components/LoadingPage/LoadingSpinner';
import { LoadState } from 'types/states/LoadState';
import { useFlight } from 'hooks/flight/useFlight';
import { ScheduleCard } from './ScheduleCard';
import { FlightStatus, getFlightStatus } from 'types/flightStatus/FlightStatus';
import PaginationControl from 'components/admin/components/PaginationControls/PaginationControls';
import { ScheduleModal } from './ScheduleModal';
import { useAirport } from 'hooks/airport/useAirport';
import { useAirplane } from 'hooks/airplane/useAirplane';
import SortControls from '../../components/SortControls/SortControls';

const AdminSchedules = () => {
    const {getAllAirports} = useAirport();
    const {getAllAirplane} = useAirplane();
    const {getAllFlightsAdmin, createFlight, changeInfoFlight} = useFlight();

    const [airports, setAirports] = useState();
    const [airplanes, setAirplanes] = useState();

    useEffect(() => {
        getAllAirports().then(value =>
            setAirports(value)
        );
        getAllAirplane().then(value => {
            setAirplanes(value)
        })
    }, []);
    
    const [flights, setFlights] = useState([]);
    const [filteredFlights, setFilteredFlights] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFlight, setEditingFlight] = useState(null);

    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });

    const mapFormDataToRequestBody = (formData) => {
        let classes = JSON.parse(JSON.stringify(formData.classDetails));
        
        const classDetailsKeys = Object.keys(formData.classDetails)
        for (var i = 0; i < classDetailsKeys.length; i++) {
            classes[classDetailsKeys[i]].price *= 1000;
        }

        const requestBody = ({
            timeStart: formData.timeStart,
            timeEnd: formData.timeEnd,
            idBeginAirport: formData.beginAirportId,
            idEndAirport: formData.endAirportId,
            idAirplane: formData.idAirplane,
            classes: classes,
        })
        console.log(requestBody);
        return requestBody;
    }

    const handleSubmit = (formData) => {        
        const requestBody = mapFormDataToRequestBody(formData);
        
        createFlight(requestBody).then(
            handleRefresh()
        )
    }

    const handleEdit = (formData) => {
        console.log(formData);
        const newFlight = ({ ...mapFormDataToRequestBody(formData), idFlight: formData.idFlight});
        console.log(newFlight);
        const requestBody = ({
            idFlight: newFlight.idFlight,
            timeStart: newFlight.timeStart,
            timeEnd: newFlight.timeEnd,
            idBeginAirport: newFlight.idBeginAirport,
            idEndAirport: newFlight.idEndAirport,
            idAirplane: newFlight.idAirplane,
        })
        changeInfoFlight(requestBody).then(() => {
            // Update the flights array with the edited flight information
            setFlights(prevFlights => 
                prevFlights.map(flight => 
                    flight.idFlight === formData.idFlight ? {
                        ...flight, 
                        timeStart: requestBody.timeStart,
                        timeEnd: requestBody.timeEnd,
                        
                    } : flight
                )
            );
            setFilteredFlights(prevFilteredFlights => 
                prevFilteredFlights.map(flight => 
                    flight.idFlight === formData.idFlight ? { ...flight, ...requestBody } : flight
                )
            );
        });

        setIsModalOpen(false);
        setEditingFlight(null);
    }

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5); // Adjust this number based on your needs
    const pageSizeOptions = [5, 10, 20];
    const [pageInput, setPageInput] = useState(1);

    // Calculate pagination
    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    const currentItems = React.useMemo(() => {
        let sorted = [...filteredFlights];
        if (sortConfig.key) {
            sorted.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sorted.slice(indexOfFirstItem, indexOfLastItem);
    }, [filteredFlights, sortConfig, indexOfFirstItem, indexOfLastItem]);
    const totalPages = Math.ceil(filteredFlights.length / pageSize);

    // Define columns for the search bar
    const columns = [
        { key: 'idFlight', label: 'Flight ID', type: 'text', sortable: true },
        { key: 'aircraft', label: 'Aircraft', type: 'text', sortable: true },
        { 
            key: 'origin', 
            label: 'Origin', 
            type: 'text',
            sortable: true
        },
        { 
            key: 'destination', 
            label: 'Destination', 
            type: 'text',
            sortable: true
        },
        { key: 'departureDate', label: 'Departure Date', type: 'datetime', showLabel: true, labelPadding: 'medium', sortable: true },
        { key: 'arrivalDate', label: 'Arrival Date', type: 'datetime', showLabel: true, labelPadding: 'medium', sortable: true },
        {
            key: 'status',
            label: 'Status',
            type: 'checkbox',
            options: [FlightStatus.ONGOING, FlightStatus.SCHEDULED, FlightStatus.COMPLETED],
            sortable: true
        }        
    ];

    const defaultColumnFilters = columns.reduce((acc, col) => ({
        ...acc, [col.key]: col.key === 'status' ? col.options : ''
    }), {});
    const [columnFilters, setColumnFilters] = useState({});
    const [globalSearch, setGlobalSearch] = useState('');    
    const [loadState, setLoadState] = useState(LoadState.LOADING);

    useEffect(() => {
        handleRefresh();
    }, []);

    const handleRefresh = () => {
        setLoadState(LoadState.LOADING);
        getAllFlightsAdmin().then((data) => {
            const mappedData = data.map(flight => ({
                ...flight,
                flightNumber: `QA${flight.idFlight}`,
                aircraft: `${flight.Airplane.code} ${flight.Airplane.type}`,
                origin: `${flight.beginAirport.city} ${flight.beginAirport.code}`,
                destination: `${flight.endAirport.city} ${flight.endAirport.code}`,
                departureDate: flight.timeStart,
                arrivalDate: flight.timeEnd,
                status: getFlightStatus(flight),
                classTypes: `${flight.ClassFlights.map(classFlight => classFlight.class).join(' ')}`,
            }))
            setFlights(mappedData);
            setFilteredFlights(mappedData);
            setLoadState(LoadState.SUCCESS);
        }).catch((error) => {
            console.error(error);
            setLoadState(LoadState.ERROR);
        });
    };

    const handleAddSchedule = () => {
        setEditingFlight(null)
        setIsModalOpen(true);
    }

    const handleResetFilters = () => {
        setGlobalSearch('');
        setColumnFilters(defaultColumnFilters);
        setSortConfig({ key: null, direction: 'asc' });
        if (tableSearchBarRef.current) {
            tableSearchBarRef.current.reset();
        }
    }

    const handleSearch = (searchQuery) => {
        setGlobalSearch(searchQuery);
        let filtered = flights.filter(flight => searchFilter(flight, searchQuery));
        filtered = filtered.filter(flight => columnFilter(flight, columnFilters));
        
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        
        setFilteredFlights(filtered);
    }

    const handleColumnFilter = (filters) => {
        setColumnFilters(filters);
        let filtered = flights.filter(flight => columnFilter(flight, filters));
        if (globalSearch) {
            filtered = filtered.filter(item => searchFilter(item, globalSearch));
        }
        setFilteredFlights(filtered);
    }

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0); // Scroll to top when page changes
    };

    // Handle page size change
    const handlePageSizeChange = (newSize) => {
        setPageSize(Number(newSize));
        setCurrentPage(1); // Reset to first page when changing page size
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [pageSize]);

    useEffect(() => {
        setPageInput(currentPage.toString());
    }, [currentPage]);

    const handlePageInputChange = (e) => {
        const value = e.target.value;
        if (value === '') {
            setPageInput('');
            return;
        }
        const page = parseInt(value);
        if (page >= 1 && page <= totalPages) {
            handlePageChange(page);
        }
    };

    const handlePageInputBlur = (e) => {
        if (e.target.value === '') {
            handlePageChange(1);
        }
    };

    const tableSearchBarRef = useRef(null);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        const sortedFlights = [...filteredFlights].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setFilteredFlights(sortedFlights);
    };

    const mapFlightToFormData = (flight) => {
        const classDetails = flight.ClassFlights.reduce((acc, value) => ({
            ...acc,
            [value.class]: {
                seats: value.seatAmount,
                seatBooked: value.seatBooked,
                price: value.currentPrice / 1000,
            }
        }), {});

        return {
            idFlight: flight.idFlight,
            idAirplane: flight.idAirplane,
            beginAirportId: flight.idbeginAirport,
            endAirportId: flight.idendAirport,
            timeStart: new Date(flight.timeStart).toISOString().slice(0, 16),
            timeEnd: new Date(flight.timeEnd).toISOString().slice(0, 16),
            classTypes: flight.ClassFlights.map(cf => cf.class),
            classDetails: classDetails
        };
    };

    const onViewDetails = (flight) => {
        const formData = mapFlightToFormData(flight);
        setEditingFlight(formData);
        setIsModalOpen(true);
    }

    return (
        <div className={styles.schedulesPage}>
            <AdminPageTitle title="Schedules Management" onAdd={handleAddSchedule} label="Add Flight" />
            <div className={styles.mainContent}>
                <div className={styles.filtersCard}>
                    <div className={styles.filterHeader}>
                        <h3>Filters</h3>
                        <button 
                            className={styles.resetButton}
                            onClick={handleResetFilters}
                        >
                            Reset
                        </button>
                    </div>
                    <div className={styles.searchContainer}>
                        <TableSearchBar 
                            ref={tableSearchBarRef}
                            columns={columns}
                            onSearch={handleSearch}
                            onColumnFilterChange={handleColumnFilter}
                            showClearAllButton={false}
                        />
                    </div>
                </div>
                <div className={styles.flightList}>
                    <div className={styles.controlsContainer}>
                        {filteredFlights.length > pageSize && (
                            <PaginationControl 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                pageSize={pageSize}
                                pageSizeOptions={pageSizeOptions}
                                totalItems={filteredFlights.length}
                                onPageSizeChange={handlePageSizeChange}
                                pageInput={pageInput}
                                onPageInputChange={handlePageInputChange}
                                onPageInputBlur={handlePageInputBlur}
                                onRefresh={handleRefresh}
                            />
                        )}
                        <SortControls 
                            columns={columns}
                            sortConfig={sortConfig}
                            onSort={handleSort}
                        />
                    </div>
                    {loadState === LoadState.LOADING ? (
                        <LoadingSpinner />
                    ) : (
                        <>
                            {currentItems.map(flight => (
                                <ScheduleCard 
                                    key={flight.idFlight} 
                                    flight={flight} 
                                    onViewDetailsClick={() => onViewDetails(flight)}
                                />
                            ))}
                        </>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <ScheduleModal
                    flight={editingFlight}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    onEdit={handleEdit}
                    airports={airports}
                    airplanes={airplanes.filter(airplane => airplane.status === "Active")}
                />
            )}
        </div>
        
    )
}

export default AdminSchedules;

