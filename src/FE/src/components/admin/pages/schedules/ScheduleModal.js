import { useState, useRef, useEffect, use } from "react";
import styles from "./ScheduleModal.module.css";

import AdminModal from "components/admin/components/Modal/AdminModal";
import AirportSearch from "components/MainContent/AirportSearch";
import AircraftSearch from "./AircraftSearch";
import { FlightStatus, getFlightStatus } from "types/flightStatus/FlightStatus";
import { convertToDateTimeLocalString } from "utils/date/convertToDateTimeLocalString";

export function ScheduleModal({ flight, onClose, onSubmit, onEdit, onDelete, airports, airplanes }) {
    const startAirportInputRef = useRef(null);
    const endAirportInputRef = useRef(null);
    const aircraftInputRef = useRef(null);
    
    const [capacity, setCapacity] = useState(0);

    const [formData, setFormData] = useState(flight || {
        idAirplane: '',
        beginAirportId: '',
        endAirportId: '',
        timeStart: '',
        timeEnd: '',
        classTypes: [],
        basePrice: '',
        classDetails: {}
    });

    useEffect(() => {
        if (flight) {
            setFormData({
                ...formData,
                timeStart: convertToDateTimeLocalString(new Date(flight.timeStart)),
                timeEnd: convertToDateTimeLocalString(new Date(flight.timeEnd)),
            })
            
        }
        console.log(formData)
    }, [])

    const isEditing = !!flight;
    const flightStatus = flight ? getFlightStatus(flight) : FlightStatus.SCHEDULED;
    const canEdit = (!isEditing) || (isEditing && flightStatus === FlightStatus.SCHEDULED);
    const showDelete = (flight) && (flightStatus !== FlightStatus.ONGOING);
    const flightDuration = isEditing ? 
        new Date(flight.timeEnd) - new Date(flight.timeStart) : 0;
    const originalDepartureDate = isEditing ? new Date(flight.timeStart) : "";

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        // Handle datetime inputs
        if (name === 'timeStart' || name === 'timeEnd') {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name === 'timeStart' ? 'departure' : 'arrival'];
                return newErrors;
            });

            const newDateTime = new Date(value);

            // Validation checks
            if (name === 'timeStart') {
                if (newDateTime < new Date()) {
                    setErrors(prev => ({
                        ...prev,
                        departure: "Departure time cannot be in the past"
                    }));
                }

                if (newDateTime < originalDepartureDate) {
                    setErrors(prev => ({
                        ...prev,
                        departure: `Delayed departure time cannot be earlier than the original departure time: ${convertToDateTimeLocalString(originalDepartureDate).split('T')[0]} ${convertToDateTimeLocalString(originalDepartureDate).split('T')[1]}`
                    }));
                }

                // If editing and there's a flight duration, update arrival time
                if (isEditing && flightDuration) {
                    const newArrivalDate = new Date(newDateTime.getTime() + flightDuration);
                    setFormData(prev => ({
                        ...prev,
                        [name]: value,
                        timeEnd: convertToDateTimeLocalString(newArrivalDate)
                    }));
                    return;
                }
            }

            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
            return;
        }

        // Handle class type checkboxes
        if (name === 'classTypes') {
            setFormData(prev => {
                const newClassTypes = prev.classTypes.includes(value)
                    ? prev.classTypes.filter(type => type !== value)
                    : [...prev.classTypes, value];
                
                // If unchecking, remove the class details
                const newClassDetails = { ...prev.classDetails };
                if (!newClassTypes.includes(value)) {
                    delete newClassDetails[value];
                } else if (!newClassDetails[value]) {
                    // Initialize details for new class type
                    newClassDetails[value] = { seatAmount: 0, currentPrice: 0 };
                }
                
                return {
                    ...prev,
                    classTypes: newClassTypes,
                    classDetails: newClassDetails
                };
            });
            return;
        }

        // Handle seats and price inputs for class types
        if (name.startsWith('seatAmount_') || name.startsWith('currentPrice_')) {
            const [field, classType] = name.split('_');
            setFormData(prev => ({
                ...prev,
                classDetails: {
                    ...prev.classDetails,
                    [classType]: {
                        ...prev.classDetails[classType],
                        [field]: parseInt(value) || 0
                    }
                }
            }));
            console.log(formData);
            return;
        }
    };

    const onSelectAirport = (type, id) => {
        if (type === "Start") {
            setFormData({...formData, beginAirportId: id});
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.origin;
                delete newErrors.destination;
                return newErrors;
            });
        } else {
            setFormData({...formData, endAirportId: id});
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.destination;
                return newErrors;
            });
        }
    };

    const onSelectAircraft = (airplane) => {
        setFormData({...formData, idAirplane: airplane.idAirplane});
        setCapacity(airplane.capacity);
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.airplane;
            delete newErrors.seats;
            return newErrors;
        });
    };

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        if (!formData.idAirplane) newErrors.airplane = "Please select an airplane";
        if (!formData.beginAirportId) newErrors.origin = "Please select origin airport";
        if (!formData.endAirportId) newErrors.destination = "Please select destination airport";
        if (!formData.timeStart || !formData.timeEnd) newErrors.departure = "Please select departure date and time";
        if (!formData.timeEnd) newErrors.arrival = "Please select arrival date and time";

        // Origin != Destination
        if (formData.beginAirportId === formData.endAirportId && formData.beginAirportId) {
            newErrors.destination = "Destination cannot be the same as origin";
        }

        // At least one class type
        if (formData.classTypes.length === 0) {
            newErrors.classTypes = "At least one class type must be selected";
        }

        // Departure < Arrival
        const departureDateTime = new Date(`${formData.timeStart}`);
        const arrivalDateTime = new Date(`${formData.timeEnd}`);
        if (departureDateTime >= arrivalDateTime) {
            newErrors.arrival = "Arrival time must be after departure time";
        }
        if (departureDateTime < Date.now()) {
            newErrors.departure = "Departure time cannot be in the past";
        }

        // Total seats validation
        const totalSeats = getTotalSeats();
        if (totalSeats > capacity) {
            newErrors.seats = `Total seats (${totalSeats}) cannot exceed airplane capacity (${capacity})`;
        }
        if (totalSeats === 0) {
            newErrors.seats = `Total seats (${totalSeats}) must not be 0`;
        }

        // Price order validation (Economy < Business < First-Class)
        const classOrder = ['Economy', 'Business', 'First-Class'];
        const selectedClasses = formData.classTypes.sort(
            (a, b) => classOrder.indexOf(a) - classOrder.indexOf(b)
        );

        for (let i = 1; i < selectedClasses.length; i++) {
            const prevClass = selectedClasses[i-1];
            const currentClass = selectedClasses[i];
            const prevPrice = formData.classDetails[prevClass]?.currentPrice || 0;
            const currentPrice = formData.classDetails[currentClass]?.currentPrice || 0;

            if (prevPrice >= currentPrice) {
                newErrors.price = `${currentClass} price must be higher than ${prevClass} price`;
                break;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const combinedData = {
                ...formData,
                timeStart: `${formData.timeStart}`,
                timeEnd: `${formData.timeEnd}`,
            };
            if (isEditing && 
                formData.timeStart !== originalDepartureDate && 
                window.confirm("You have updated the departure time to be delayed by " + ((Date.parse(formData.timeStart) - Date.parse(originalDepartureDate))/60000) + " minutes.\nThis action cannot be undone.\nAre you sure you want to continue?")) {
                onEdit(combinedData)
            }
            else if (!isEditing) onSubmit(combinedData);
        }
    };

    const getTotalSeats = () => {
        return Object.values(formData.classDetails)
            .reduce((sum, detail) => sum + (detail.seatAmount || 0), 0);
    };

    return (
        <AdminModal 
            title={isEditing ? 'Flight Details' : 'Add Flight Schedule'} 
            onClose={onClose}
            handleDelete={showDelete ? () => onDelete(flight.idFlight) : null}
            submitLabel={isEditing ? 'Confirm' : 'Submit'}
            handleSubmit={handleSubmit}
        >
            {isEditing && (
                <div className={styles.flightInfo}>
                    <div className={styles.flightHeader}>
                        <span className={styles.flightId}>Flight ID: QA{flight.idFlight}</span>
                        <span className={`${styles.status} ${styles[flightStatus.toLowerCase()]}`}>
                            {flightStatus}
                        </span>
                    </div>
                    {!canEdit && (
                        <div className={styles.editingDisabled}>
                            Flight schedule cannot be modified in {flightStatus.toLowerCase()} status
                        </div>
                    )}
                </div>
            )}

            <div className={styles.formGroup}>
                <label>Airplane:</label>
                <AircraftSearch
                    airplanes={!canEdit ? airplanes : airplanes.filter(airplane => airplane.status === "Active")}
                    onSelectAircraft={onSelectAircraft}
                    inputRef={aircraftInputRef}
                    disabled={isEditing}
                    initialValue={formData.idAirplane}
                />
                {errors.airplane && <span className={styles.error}>{errors.airplane}</span>}
            </div>

            <div className={styles.formGroup}>
                <label>Origin Airport:</label>
                <AirportSearch
                    airports={airports}
                    type="Start"
                    onSelectAirport={onSelectAirport}
                    inputRef={startAirportInputRef}
                    disabled={isEditing}
                    initialValue={formData.beginAirportId}
                />
                {errors.origin && <span className={styles.error}>{errors.origin}</span>}
            </div>

            <div className={styles.formGroup}>
                <label>Destination Airport:</label>
                <AirportSearch
                    airports={airports}
                    type="End"
                    onSelectAirport={onSelectAirport}
                    inputRef={endAirportInputRef}
                    disabled={isEditing}
                    initialValue={formData.endAirportId}
                />
                {errors.destination && <span className={styles.error}>{errors.destination}</span>}
            </div>

            <div className={styles.formGroup}>
                <label>Departure:</label>
                <input
                    type="datetime-local"
                    name="timeStart"
                    value={formData.timeStart}
                    onChange={handleChange}
                    required
                    disabled={!canEdit}
                />
                {errors.departure && <span className={styles.error}>{errors.departure}</span>}
            </div>

            <div className={styles.formGroup}>
                <label>Arrival:</label>
                <input
                    type="datetime-local"
                    name="timeEnd"
                    value={formData.timeEnd}
                    onChange={handleChange}
                    required
                    disabled={!canEdit}
                />
                {errors.arrival && <span className={styles.error}>{errors.arrival}</span>}
            </div>

            <div className={styles.formGroup}>
                <label style={{ marginBottom:"0px" }}>Class Types:</label>
                <div className={styles.checkboxGroup}>
                    {['Economy', 'Business', 'First-Class'].map(classType => (
                        <div key={classType} className={styles.classTypeContainer}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="classTypes"
                                    value={classType}
                                    checked={formData.classTypes.includes(classType)}
                                    onChange={handleChange}
                                    disabled={isEditing}
                                />
                                {classType}
                            </label>
                            {formData.classTypes.includes(classType) && (
                                <div className={styles.classTypeDetails}>
                                    <div className={styles.inputGroup}>
                                        <label>Seats:</label>
                                        <input
                                            type="number"
                                            name={`seatAmount_${classType}`}
                                            value={formData.classDetails[classType]?.seatAmount || 0}
                                            onChange={handleChange}
                                            disabled={isEditing}
                                            min="0"
                                            max={capacity - (getTotalSeats() - (formData.classDetails[classType]?.seatAmount || 0))}
                                            placeholder="Number of seats"
                                            title={`Available seats: ${capacity - (getTotalSeats() - (formData.classDetails[classType]?.seatAmount || 0))}`}
                                            required
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Price (kVND):</label>
                                        <input
                                            type="number"
                                            name={`currentPrice_${classType}`}
                                            value={formData.classDetails[classType]?.currentPrice || 0}
                                            onChange={handleChange}
                                            disabled={isEditing}
                                            min="0"
                                            placeholder="Price in kVND"
                                            title="Enter price in kVND"
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    
                </div>
                <div className={styles.capacityInfo}>
                    Total Seats: {getTotalSeats()} / {capacity}
                    {errors.seats && <span className={styles.error}>{errors.seats}</span>}
                </div>
                
            </div>
        </AdminModal>
    );
} 