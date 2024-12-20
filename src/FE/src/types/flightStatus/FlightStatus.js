export const FlightStatus = {
    ONGOING: "Ongoing",
    SCHEDULED: "Scheduled",
    COMPLETED: "Completed",
}

export const getFlightStatus = (flight) => {
    const now = Date.now();
    const startTime = Date.parse(flight.timeStart);
    const endTime = Date.parse(flight.timeEnd);
    
    if (startTime > now) return FlightStatus.SCHEDULED;
    if (endTime > now) return FlightStatus.ONGOING;
    return FlightStatus.COMPLETED;
}