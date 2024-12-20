import styles from './ScheduleCard.module.css'
import { FaPlaneDeparture } from 'react-icons/fa';

const RouteLineDecor = () => {
    return (
        <div className={styles.routeLine}>
            <div className={styles.dot}></div>
            <div className={styles.dottedLine}></div>
            <div className={styles.planeIcon}>
                <FaPlaneDeparture />
            </div>
            <div className={styles.dottedLine}></div>
            <div className={styles.dot}></div>
        </div>
    );
};

export const ScheduleCard = ({flight, onViewDetailsClick}) => {
    return (
        <div className={styles.flightCard}>
            <div className={styles.cardHeader}>
                <span className={styles.flightId}>Flight Number: QA{flight.idFlight}</span>
                <span className={`${styles.status} ${styles[flight.status.toLowerCase()]}`}>
                    {flight.status}
                </span>
            </div>
            <div className={styles.cardTopSection}>
                <div className={styles.flightInfo}>
                    <span className={styles.flightNumber}>{flight.Airplane.code}</span>
                    <span className={styles.aircraftType}>{flight.Airplane.type}</span>
                </div>
                <div className={styles.verticalDivider}></div>
                <div className={styles.routeInfo}>
                    <div className={styles.departure}>
                        <div className={styles.routeCity}>{flight.beginAirport.city}</div>                        
                        <div className={styles.time}>{new Date(flight.timeStart).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: "2-digit",
                            year: '2-digit',
                        })}</div>
                        <div className={styles.time}>{new Date(flight.timeStart).toLocaleTimeString('en-GB', {
                            hour: 'numeric',
                            minute: '2-digit',
                        })}</div>
                    </div>

                    <div className={styles.routeMiddle}>
                        <div className={styles.airportCode}>{flight.beginAirport.code}</div>
                        <RouteLineDecor />
                        <div className={styles.airportCode}>{flight.endAirport.code}</div>
                    </div>

                    <div className={styles.arrival}>
                        <div className={styles.routeCity}>{flight.endAirport.city}</div>                        
                        <div className={styles.time}>{new Date(flight.timeEnd).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: "2-digit",
                            year: '2-digit',
                        })}</div>
                        <div className={styles.time}>{new Date(flight.timeEnd).toLocaleTimeString('en-GB', {
                            hour: 'numeric',
                            minute: '2-digit',
                        })}</div>
                    </div>
                </div>
            </div>
            <div className={styles.horizontalDivider}></div>
            <div className={styles.cardBottomSection}>
                <div className={styles.classInfo}>
                    {flight.ClassFlights.map(classFlight => (
                        <span key={classFlight.idclassFlight} className={`${styles.classTag} ${styles[classFlight.class.toLowerCase()]}`}>
                            {classFlight.class}: {classFlight.seatBooked}/{classFlight.seatAmount}
                        </span>
                    ))}
                </div>
                <button className={styles.viewButton} onClick={onViewDetailsClick}>View Details</button>
            </div>
        </div>
    );
};