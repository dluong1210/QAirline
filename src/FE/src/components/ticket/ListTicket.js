import React, { useEffect } from "react";
import { useState, useRef } from "react";
import "./ListTicket.css";
import TicketCard from "./TicketCard.js";
import FlightMap from "components/admin/pages/flights/FlightMap.js";

import { getCoordinates } from "data/const/airportCoordinates";
import { formatDate } from "utils/date/formatDate";

const ListTicket = ({ rawTickets }) => {
  const listSectionRef = useRef(null);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (rawTickets && rawTickets.length > 0) {
      const data = rawTickets.map((ticket) => ({
        idTicket: ticket.idTicket,
        idFlight: ticket.ClassFlight.Flight.idFlight,
        beginAirport: ticket.ClassFlight.Flight.beginAirport,
        endAirport: ticket.ClassFlight.Flight.endAirport,
        timeStart: ticket.ClassFlight.Flight.timeStart,
        timeEnd: ticket.ClassFlight.Flight.timeEnd,
        class: ticket.ClassFlight.class,
        status: ticket.status,
        price: ticket.price,
        origin: ticket.ClassFlight.Flight.beginAirport.city,
        originCoords: Object.values(
          getCoordinates(ticket.ClassFlight.Flight.beginAirport.code)
        ),
        destination: ticket.ClassFlight.Flight.endAirport.city,
        destinationCoords: Object.values(
          getCoordinates(ticket.ClassFlight.Flight.endAirport.code)
        ),
        departureTime: formatDate(ticket.ClassFlight.Flight.timeStart),
        arrivalTime: formatDate(ticket.ClassFlight.Flight.timeEnd),
      }));
      setTickets(data);
      window.scrollTo({ top: 40, behavior: "smooth" });
    }
  }, []);

  const handleTicketCardClick = (ticket) => {
    if (!selectedTicket) {
      setSelectedTicket(ticket);
    } else if (ticket.idTicket === selectedTicket.idTicket) {
      setSelectedTicket(null);
    } else {
      setSelectedTicket(ticket);
    }
  };

  return (
    <div className="ticket-tab">
      <div className="list-section" ref={listSectionRef}>
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.idTicket}
            ticket={ticket}
            selectedTicket={selectedTicket}
            onSelectTicket={handleTicketCardClick}
            containerRef={listSectionRef}
          />
        ))}
      </div>
      <div className="map-section">
        <FlightMap flights={selectedTicket ? [selectedTicket] : []} />
      </div>
    </div>
  );
};

export default ListTicket;
