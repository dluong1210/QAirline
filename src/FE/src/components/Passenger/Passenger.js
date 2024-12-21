import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PassengerForm from "../PassengerForm/PassengerForm";
import PassengerFormChildren from "../PassengerFormChildren/PassengerFormChildren";
import "./Passenger.css";
import { TotalBill } from "../SearchFlight/SearchFlight.js";
import Notification from "../Notification/Notification.js";
import { BACKEND_BASE_URL } from "services/api";

const Passenger = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [confirmBoxVisible, setConfirmBoxVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const {
    booking,
    startDestination,
    endDestination,
    passengerSummary,
    isRoundWay,
  } = location.state || {};
  const [adultCount, setAdultCount] = useState(0);
  const [childrenCount, setChildrenCount] = useState(0);
  const [formDataArray, setFormDataArray] = useState([]);
  const [messageNotification, setMessageNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateFormData = (index, data, type) => {
    setFormDataArray((prevData) => {
      const updatedData = [...prevData];
      updatedData[index] = { ...data, type };
      return updatedData;
    });
  };

  useEffect(() => {
    const extractPassengerCount = (summary) => {
      const adultMatch = summary.match(/(\d+)\s*adults/);
      const childrenMatch = summary.match(/(\d+)\s*children/);

      if (adultMatch) {
        setAdultCount(parseInt(adultMatch[1], 10));
      }
      if (childrenMatch) {
        setChildrenCount(parseInt(childrenMatch[1], 10));
      }
    };

    extractPassengerCount(passengerSummary);
  }, [passengerSummary]);

  const checkValid = () => {
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'country'];

    for (const formData of formDataArray) {
      for (const field of requiredFields) {
        if (!formData[field] || formData[field].trim() === "") {
          setMessageNotification("Please fill in all this form");
          setShowNotification(true);
          return false;
        }
      }

      const dob = formData.dateOfBirth;
      const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
      if (!dateRegex.test(dob)) {
        setMessageNotification("Please enter a valid date of birth");
        setShowNotification(true);
        return false;
      }

      if (formData.type === "adult") {
        if (!formData.phoneNumber || formData.phoneNumber.trim() === "") {
          setMessageNotification("Please fill in phone number");
          setShowNotification(true);
          return false;
        }

        if (!formData.email || formData.email.trim() === "") {
          setMessageNotification("Please fill in email");
          setShowNotification(true);
          return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setMessageNotification("Please enter a valid email address");
          setShowNotification(true);
          return false;
        }
      }
    }

    return true;
  };

  const bookTicket = async () => {
    if (!checkValid()) {
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);

      return;
    }
    const url = `${BACKEND_BASE_URL}/booking`;

    const body1 = {
      idClassFlight: booking.forward.idClassFlight,
      amount: adultCount + childrenCount,
    };
    const body2 = isRoundWay
      ? {
          idClassFlight: booking.backward.idClassFlight,
          amount: adultCount + childrenCount,
        }
      : null;

    try {
      const requests = [
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body1),
          credentials: "include",
        }),
      ];

      if (body2) {
        requests.push(
          fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body2),
            credentials: "include",
          })
        );
      }

      const responses = await Promise.all(requests);

      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok) {
          throw new Error(`Request ${i + 1} failed`);
        }
      }

      const [data1, data2] = await Promise.all(
        responses.map((res) => res.json())
      );
      setSuccess(true);
      setMessageNotification("Book ticket successfully!!");
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      setTimeout(() => {
        setSuccess(false);
        navigate("/");
      }, 4000);
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNowClick = () => {
    if (checkValid()) { 
      setShowOverlay(true);
      setConfirmBoxVisible(true);
    } else {
      setTimeout(() => {
        setShowNotification(false);
      }, 3000); 
    }
  };

  const handleConfirm = (isConfirmed) => {
    if (isConfirmed) {
      bookTicket();
    }
    setShowOverlay(false);
    setConfirmBoxVisible(false);
  };

  return (
    <div className="search-flight-container">
      <Notification
        message={messageNotification}
        show={showNotification}
        isSuccessful={success}
      />
      <div className="content">
        <div
          className="all-forms"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            paddingBottom: "100px",
          }}
        >
          {Array.from({ length: adultCount }).map((_, index) => (
            <PassengerForm
              key={`adult-${index}`}
              stt={index + 1}
              onUpdate={(data) => updateFormData(index, data, "adult")}
            />
          ))}
          {Array.from({ length: childrenCount }).map((_, index) => (
            <PassengerFormChildren
              key={`children-${index}`}
              stt={index + 1}
              onUpdate={(data) =>
                updateFormData(adultCount + index, data, "child")
              }
            />
          ))}
        </div>
        <TotalBill
          booking={booking}
          startDestination={startDestination}
          endDestination={endDestination}
          isRoundWay={isRoundWay}
        />
      </div>

      <div className="fs-continue">
        <div className="continue-container">
          <button
            className="fs-btn-continue fs-btn-back"
            onClick={() => window.history.go(-1)}
          >
            Back
          </button>
          <div className="summary-price">
            <span className="special-des-price">Total price</span>
            <span className="special-price">{booking.totalPrice} VND</span>
          </div>
          <button className="fs-btn-continue" onClick={handleBookNowClick}>
            Book now
          </button>
        </div>
      </div>

      {showOverlay && (
        <div className="overlay">
          {confirmBoxVisible && (
            <div className="confirm-box" style={{display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "white", padding: "30px", borderRadius: "20px"}}>
              <p style={{fontSize: "18px", fontWeight: "600"}}>Are you sure with all the information?</p>
              <div className="confirm-buttons" style={{display: "flex", gap: "20px", justifyContent: "center", marginTop: "20px"}}>
                <button className="btn" style={{color: "white", backgroundColor: "green", padding: "10px 30px", borderRadius: "30px", fontWeight: "600"}} onClick={() => handleConfirm(true)}>Yes</button>
                <button className="btn" style={{color: "white", backgroundColor: "rgb(224, 54, 54)", padding: "10px 30px", borderRadius: "30px", fontWeight: "600"}} onClick={() => handleConfirm(false)}>No</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Passenger;
