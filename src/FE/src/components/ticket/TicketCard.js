import React, { useEffect, useState, useRef } from "react";
import "./TicketCard.css";
import { BACKEND_BASE_URL } from "services/api";

const TicketCard = ({
  ticket,
  onSelectTicket,
  selectedTicket,
  containerRef,
  setListTicket,
  setShowTicketDetail,
  setShowNotification,
  setNotification,
}) => {
  const cardRef = useRef(null);

  const [isSelected, setSelected] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const formatDateAndTime = (isoDate) => {
    const date = new Date(isoDate);

    const formattedDate = date.toLocaleDateString("en-GB");

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return { formattedDate, formattedTime };
  };

  const calculateTimeDifference = (startIsoDate, endIsoDate) => {
    const startDate = new Date(startIsoDate);
    const endDate = new Date(endIsoDate);

    const diffInMilliseconds = Math.abs(endDate - startDate) - 30 * 60 * 1000;

    const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor(
      (diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
    );

    return `${hours}h ${minutes}m`;
  };

  const start = formatDateAndTime(ticket.timeStart);
  const end = formatDateAndTime(ticket.timeEnd);
  const time = calculateTimeDifference(ticket.timeStart, ticket.timeEnd);

  const handleClick = () => {
    if (onSelectTicket) {
      onSelectTicket(ticket);

      if (!isSelected) {
        if (cardRef.current && containerRef.current) {
          const cardRect = cardRef.current.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          const scrollTop =
            containerRef.current.scrollTop +
            (cardRect.top - containerRect.top) -
            65;

          containerRef.current.scrollTo({
            top: scrollTop,
            behavior: "smooth",
          });
        }
        setIsAnimating(true);
        setTimeout(() => {
          setSelected(true);
          setIsAnimating(false);
        }, 10);
      } else {
        setShowTicketDetail(false);
        setSelected(false);
        setIsAnimating(true);
        setTimeout(() => {
          setIsAnimating(false);
        }, 300);
      }
    }
  };

  const handleViewDetails = () => {
    // console.log("View details clicked");
    if (isSelected) {
      setShowTicketDetail((prev) => !prev);
    }
  };

  const handleDeleteTicket = async () => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/booking/?idTicket=${ticket.idTicket}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!response.ok) {
        setNotification("Error delete ticket");
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        throw new Error("Error delete ticket");
      } else {
        setListTicket((prevList) =>
          prevList.filter((tk) => tk != null && tk.idTicket !== ticket.idTicket)
        );
        onSelectTicket(null);
        setNotification("Delete ticket successfully.");
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        throw new Error("Error delete ticket");
      }
    } catch (err) {
      console.log(err.message);
    }
  };
  const confirmDelete = () => {
    const now = new Date();
    const startDate = new Date(ticket.timeStart);
    if (startDate - now < 24 * 60 * 60 * 1000) {
      setNotification(
        "Can't delete ticket with departure date less than 1 day away."
      );
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    } else {
      setShowDeleteConfirmation(true);
    }
  };

  const handleConfirmDelete = () => {
    handleDeleteTicket();
    setShowDeleteConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  useEffect(() => {
    if (
      isSelected &&
      selectedTicket &&
      selectedTicket.idTicket != ticket.idTicket
    ) {
      window.scrollTo(0, 50);
      setShowTicketDetail(false);
      setSelected(false);
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  }, [selectedTicket]);

  return (
    <div>
      <div
        ref={cardRef}
        className={`ticket-card ${isSelected ? "selected" : ""}`}
        onClick={handleClick}
      >
        <div className="airport-code">
          <div>{ticket.beginAirport.code}</div>
          <div className="right">{ticket.endAirport.code}</div>
        </div>

        <div className="city-name">
          <div>{ticket.beginAirport.city}</div>
          <div className="right">{ticket.endAirport.city}</div>
        </div>
        <div className="airport-info">
          <div>{ticket.beginAirport.name}</div>
          <div className="right">{ticket.endAirport.name}</div>
        </div>
        <div className="dot-container">
          <div className="dot start-dot"></div>
          <div className="dot end-dot"></div>
          <img className="plane-icon" src="img/plane.png" alt="plane" />
          <div className="dot start-overlay"></div>
          <div className="dot end-overlay"></div>
          <div className="line"></div>
        </div>
        <div className="flight-time">
          <div>Depart</div>
          <div>{time}</div>
          <div>Arrive</div>
        </div>

        <div className="date">
          <div>{start.formattedDate}</div>
          <div className="right">{end.formattedDate}</div>
        </div>

        <div className="time">
          <div>{start.formattedTime}</div>
          <div className="right">{end.formattedTime}</div>
        </div>

        <div className="line-solid"></div>

        <div className="total-price">
          <div>{ticket.class}</div>
          <div className={`${ticket.status.toLowerCase()}`}>
            {ticket.status}
          </div>
          <div className="right">
            {ticket.price.toLocaleString("vi-VN")} VND
          </div>
        </div>
      </div>

      {(isSelected || isAnimating) && (
        <div
          className={`action-box ${
            isSelected ? "show" : isAnimating ? "hide" : ""
          }`}
        >
          <button className="btn delete-ticket" onClick={confirmDelete}>
            <i className="fas fa-trash"></i>
            <span>Delete Ticket</span>
          </button>
          <button className="btn view-details" onClick={handleViewDetails}>
            <span>View Details </span>
            <i className="fas fa-eye"></i>
          </button>
        </div>
      )}

      {showDeleteConfirmation && (
        <>
          <div className="overlay-delete"></div>
          <div className="delete-confirmation-box">
            <div className="confirmation-message">
              <p style={{ fontSize: "18px", fontWeight: "600" }}>
                Are you sure you want to delete this ticket?
              </p>
            </div>
            <div className="confirmation-buttons">
              <button
                className="btn yes"
                onClick={handleConfirmDelete}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "30px",
                }}
              >
                Yes
              </button>
              <button
                className="btn no"
                onClick={handleCancelDelete}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "30px",
                }}
              >
                No
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TicketCard;
