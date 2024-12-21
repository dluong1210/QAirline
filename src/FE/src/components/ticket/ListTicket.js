import React, { use, useEffect } from "react";
import { useState, useRef } from "react";
import "./ListTicket.css";
import TicketCard from "./TicketCard.js";
import FlightMap from "components/admin/pages/flights/FlightMap.js";
import { TicketComponent } from "components/pages/MyFlights.js";

import { getCoordinates } from "data/const/airportCoordinates";
import { formatDate } from "utils/date/formatDate";

const sample = {
  idTicket: 120001,
  code: "QA90001-C90003-S8",
  status: "Unpaid",
  price: 1500000,
  ClassFlight: {
    class: "First-Class",
    seatAmount: 10,
    seatBooked: 10,
    currentPrice: 1500000,
    Flight: {
      idFlight: 90001,
      timeStart: "2024-12-16T18:00:00.000Z",
      timeEnd: "2024-12-16T21:00:00.000Z",
      beginAirport: {
        name: "Tan Son Nhat International Airport",
        country: "Vietnam",
        city: "Ho Chi Minh City",
        code: "SGN",
      },
      endAirport: {
        name: "Noi Bai International Airport",
        country: "Vietnam",
        city: "Hanoi",
        code: "HAN",
      },
    },
  },
};

const ListTicket = ({ rawTickets, setShowNotification, setNotification }) => {
  const listSectionRef = useRef(null);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [showTicketDetail, setShowTicketDetail] = useState(false);

  // console.log(rawTickets.find((ticket) => ticket.idTicket === 120001));
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

  useEffect(() => {
    if (showTicketDetail) window.scrollTo(0, 430);
  }, [showTicketDetail]);

  const handleTicketCardClick = (ticket) => {
    if (!selectedTicket) {
      setSelectedTicket(ticket);
    } else if (ticket && ticket.idTicket === selectedTicket.idTicket) {
      setSelectedTicket(null);
    } else {
      setSelectedTicket(ticket);
    }
  };

  return (
    <div>
      <div className="ticket-tab">
        <div className="list-section" ref={listSectionRef}>
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.idTicket}
              ticket={ticket}
              selectedTicket={selectedTicket}
              onSelectTicket={handleTicketCardClick}
              containerRef={listSectionRef}
              setListTicket={setTickets}
              setShowTicketDetail={setShowTicketDetail}
              setShowNotification={setShowNotification}
              setNotification={setNotification}
            />
          ))}
        </div>
        <div className="map-section">
          <FlightMap flights={selectedTicket ? [selectedTicket] : []} />
        </div>
      </div>
      {showTicketDetail && selectedTicket ? (
        <TicketComponent
          ticket={rawTickets.find(
            (ticket) => ticket.idTicket === selectedTicket.idTicket
          )}
        />
      ) : null}
    </div>
  );
};

export default ListTicket;
