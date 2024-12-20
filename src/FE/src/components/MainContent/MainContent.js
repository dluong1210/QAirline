import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./MainContent.css";
import AirportSearch from "./AirportSearch.js";
import DatePicker from "./DatePicker";
import Notification from "../Notification/Notification";
import PassengerSelector from "./PassengerSelector";
import { BACKEND_BASE_URL } from "services/api";

function MainContent() {
  const [ passengerData, setPassengerData ] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });

  const handlePassengerChange = (updatedPassengers) => {
    setPassengerData(updatedPassengers);
  };

  const passengerSummary = (() => {
    const { adults, children, infants } = passengerData;
    let summary = `${adults} adults`;
    if (children > 0) summary += `, ${children} children`;
    if (infants > 0) summary += `, ${infants} infants`;
    return summary;
  })();

  const startAirportInputRef = useRef(null);
  const endAirportInputRef = useRef(null);
  const startDatePickerRef = useRef(null);
  const endDatePickerRef = useRef(null);

  const [ flightForwardData, setFlightForwardData ] = useState([]);
  const [ flightBackwardData, setFlightBackwardData ] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(null);
  const [ selectedType, setSelectedType ] = useState("roundTrip");
  const [ airports, setAirports ] = useState([]);
  const [ query, setQuery ] = useState("");

  const [ idBeginAirport, setIdBeginAirport ] = useState(null);
  const [ idEndAirport, setIdEndAirport ] = useState(null);
  const [ startDestination, setStartDestination ] = useState(null);
  const [ endDestination, setEndDestination ] = useState(null);
  const [ departureDate, setDepartureDate ] = useState(null);
  const [ returnDate, setReturnDate ] = useState(null);
  const [ showNotification, setShowNotification ] = useState(false);
  const [ showNoFlight, setShowNoFlight ] = useState(false);
  const [showInvalidDate, setShowInvalidDate] = useState(false);

  const handleDateChange = (date, isEnd) => {
    if (isEnd) {
      setReturnDate(date);
    } else {
      setDepartureDate(date);
    }
  };

  const navigate = useNavigate();
  const [ id2Destination, setId2Destination ] = useState(null);

  useEffect(() => {
    const fetchAirport = async () => {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/airport/`, {
          method: "GET",
        });
        if (res.ok) {
          const result = await res.json();
          setAirports(result);
          setId2Destination(
            result.reduce((acc, airport) => {
              acc[ airport.idairport ] = airport.city;
              return acc;
            }, {})
          );
        } else {
          throw new Error("Failed to fetch airport data!");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAirport();
  }, []);

  const handleSelectAirport = (type, id) => {
    if (type === "Start") {
      setIdBeginAirport(id);
      setStartDestination(id2Destination[ id ]);
    } else {
      setIdEndAirport(id);
      setEndDestination(id2Destination[ id ]);
    }
  };

  const handleFlightTypeChange = (type) => {
    setSelectedType(type);
    const returnDate = document.querySelector(".input-enddate");
    const endDes = document.querySelector(".input-enddes");
    if (type === "oneWay") {
      returnDate.classList.add("hidden-return");
      endDes.classList.add("hidden-end");
    }

    if (type === "roundTrip") {
      returnDate.classList.remove("hidden-return");
      endDes.classList.remove("hidden-end");
    }
  };

  const handleSubmit = async () => {
    const currentDate = new Date();
    if (selectedType === "roundTrip") {
      if (!idBeginAirport || !idEndAirport || !departureDate || !returnDate) {
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
        return;
      }

      if (departureDate < currentDate || returnDate < currentDate) {
        setShowInvalidDate(true);
        setTimeout(() => {
          setShowInvalidDate(false);
        }, 3000);
        return;
      }

      if (departureDate > returnDate) {
        setShowInvalidDate(true);
        setTimeout(() => {
          setShowInvalidDate(false);
        }, 3000);
        return;
      }

      setLoading(true); // Show loading immediately

      const startDay = departureDate.getDate();
      const startMonth = departureDate.getMonth() + 1;
      const startYear = departureDate.getFullYear();
      const endDay = returnDate.getDate();
      const endMonth = returnDate.getMonth() + 1;
      const endYear = returnDate.getFullYear();

      const url_forward = `${BACKEND_BASE_URL}/flight/searchFlight?day=${startDay}&month=${startMonth}&year=${startYear}&idBeginAirport=${idBeginAirport}&idEndAirport=${idEndAirport}`;
      const url_backward = `${BACKEND_BASE_URL}/flight/searchFlight?day=${endDay}&month=${endMonth}&year=${endYear}&idBeginAirport=${idEndAirport}&idEndAirport=${idBeginAirport}`;

      try {
        const response_forward = await fetch(url_forward, { method: "GET" });
        const response_backward = await fetch(url_backward, { method: "GET" });

        if (
          (response_forward.ok || response_forward.status === 404) &&
          (response_backward.ok || response_backward.status === 404)
        ) {
          const data_forward = response_forward.ok
            ? await response_forward.json()
            : [];
          const data_backward = response_backward.ok
            ? await response_backward.json()
            : [];

          setFlightForwardData(data_forward);
          setFlightBackwardData(data_backward);

          setTimeout(() => {
            if (data_forward.length === 0 || data_backward.length === 0) {
              setShowNoFlight(true); // Show the "No Flights" message
              setLoading(false); // Stop loading when showing the message
              setTimeout(() => {
                setShowNoFlight(false); // Hide the message after 3 seconds
              }, 3000);
            } else {
              setLoading(false); // Stop loading before navigating
              navigate("/searchflights", {
                state: {
                  flightForwardData: data_forward,
                  flightBackwardData: data_backward,
                  startDestination,
                  endDestination,
                  selectedType,
                  passengerSummary,
                },
              });
            }
          }, 3000); // Ensure loading is active for 3 seconds
        } else {
          setError("No flights found or an error occurred.");
          setLoading(false);
        }
      } catch (err) {
        setError("An error occurred: " + err.message);
        setLoading(false);
      }
    } else {
      // One-way trip
      if (!idBeginAirport || !idEndAirport || !departureDate) {
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
        return;
      }

      if (departureDate < currentDate) {
        setShowInvalidDate(true);
        setTimeout(() => {
          setShowInvalidDate(false);
        }, 3000);
        return;
      }

      setLoading(true); // Show loading immediately

      const startDay = departureDate.getDate();
      const startMonth = departureDate.getMonth() + 1;
      const startYear = departureDate.getFullYear();

      const url_forward = `${BACKEND_BASE_URL}/flight/searchFlight?day=${startDay}&month=${startMonth}&year=${startYear}&idBeginAirport=${idBeginAirport}&idEndAirport=${idEndAirport}`;

      try {
        const response_forward = await fetch(url_forward, { method: "GET" });

        if (response_forward.ok || response_forward.status === 404) {
          const data_forward = response_forward.ok
            ? await response_forward.json()
            : [];

          setFlightForwardData(data_forward);

          setTimeout(() => {
            if (data_forward.length === 0) {
              setShowNoFlight(true); // Show the "No Flights" message
              setLoading(false); // Stop loading when showing the message
              setTimeout(() => {
                setShowNoFlight(false); // Hide the message after 3 seconds
              }, 3000);
            } else {
              setLoading(false); // Stop loading before navigating
              navigate("/searchflights", {
                state: {
                  flightForwardData: data_forward,
                  startDestination,
                  endDestination,
                  selectedType,
                  passengerSummary,
                },
              });
            }
          }, 3000); // Ensure loading is active for 3 seconds
        } else {
          setError("No flights found or an error occurred.");
          setLoading(false);
        }
      } catch (err) {
        setError("An error occurred: " + err.message);
        setLoading(false);
      }
    }
  };


  return (
    <div className="main-content">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-container">
            <img src="img/loading.gif" alt="Loading" />
            <p>Searching...</p>
          </div>
        </div>
      )}

      <Notification
        message="Please fill in all fields"
        show={showNotification}
      />
      <Notification
        message="We have no flights for your option"
        show={showNoFlight}
      />
      <Notification
        message="Please select a valid date"
        show={showInvalidDate}
      />
      <div className="content">
        <div className="main-leftcontent">
          <img
            src="img/destination.svg"
            alt=""
            width="60px"
            className="destination"
          />
          <button className="ranking btn">
            World No.1 Flight Booking Platform
          </button>
          <h1 className="animate__animated animate__bounce">
            DISCOVER <span className="red-text">PREMIUM</span>
            <br />
            <span className="red-text">FLIGHTS</span> WITH EASE!
          </h1>
          <p className="des">
            Find top destination and look effortlessly with out seamless flight
            search and booking experience
          </p>

          <div className="main-booking">
            <div className="flight-options">
              <label
                className="radio-label"
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: "20px",
                  cursor: "pointer",
                  fontWeight: "600",
                  color: "white",
                }}
              >
                <input
                  className="custom-radio"
                  type="radio"
                  name="flightType"
                  value="roundTrip"
                  checked={selectedType === "roundTrip"}
                  onChange={() => handleFlightTypeChange("roundTrip")}
                  style={{
                    marginRight: "5px",
                    marginBottom: "5px",
                    cursor: "pointer",
                  }}
                />
                Round Way
              </label>

              <label
                className="radio-label"
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  fontWeight: "600",
                  color: "white",
                }}
              >
                <input
                  type="radio"
                  className="custom-radio"
                  name="flightType"
                  value="oneWay"
                  checked={selectedType === "oneWay"}
                  onChange={() => handleFlightTypeChange("oneWay")}
                  style={{
                    marginRight: "5px",
                    marginBottom: "5px",
                    cursor: "pointer",
                  }}
                />
                One Way
              </label>
            </div>
            <div className="booking-container">
              <div className="flight-details">
                <div className="flight-search-bar">
                  <div className="input-group">
                    <span className="icon">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M6 19.5456L8 19.5456L13 11.4172L18.5 11.4172C18.8978 11.4172 19.2794 11.2566 19.5607 10.9708C19.842 10.685 20 10.2974 20 9.89314C20 9.48894 19.842 9.10128 19.5607 8.81546C19.2794 8.52965 18.8978 8.36908 18.5 8.36908L13 8.36908L8 0.240722L6 0.240722L8.5 8.36908L3 8.36908L1.5 6.33699L-2.62268e-07 6.33699L1 9.89314L-5.68248e-07 13.4493L1.5 13.4493L3 11.4172L8.5 11.4172L6 19.5456Z"
                          fill="#333333"
                        />
                      </svg>
                    </span>
                    <AirportSearch
                      airports={airports}
                      type="Start"
                      idOther={idEndAirport}
                      onSelectAirport={handleSelectAirport}
                      nextInputRef={startDatePickerRef}
                      inputRef={startAirportInputRef}
                    />
                  </div>

                  <DatePicker
                    type="Departure Date"
                    ref={startDatePickerRef}
                    nextInputRef={endAirportInputRef}
                    isEnd={false}
                    onDateChange={handleDateChange}
                  />
                </div>

                <div className="flight-search-bar input-enddes">
                  <div className="input-group">
                    <span className="icon">
                      <svg
                        width="13"
                        height="19"
                        viewBox="0 0 13 19"
                        fill="none"
                      >
                        <path
                          d="M10.6161 1.85455C9.44983 0.6671 7.86807 0 6.21875 0C4.56944 0 2.98767 0.6671 1.82143 1.85455C0.655188 3.04199 0 4.65252 0 6.33182C0 11.0807 6.21875 18.0909 6.21875 18.0909C6.21875 18.0909 12.4375 11.0807 12.4375 6.33182C12.4375 4.65252 11.7823 3.04199 10.6161 1.85455Z"
                          fill="#333333"
                        ></path>
                        <circle
                          cx="6.21879"
                          cy="6.21879"
                          r="2.8267"
                          fill="white"
                        ></circle>
                      </svg>
                    </span>
                    <AirportSearch
                      airports={airports}
                      type="End"
                      idOther={idBeginAirport}
                      onSelectAirport={handleSelectAirport}
                      nextInputRef={endDatePickerRef}
                      inputRef={endAirportInputRef}
                    />
                  </div>

                  <DatePicker
                    type="Return Date"
                    ref={endDatePickerRef}
                    nextInputRef={null}
                    isEnd={true}
                    onDateChange={handleDateChange}
                  />
                </div>

                <PassengerSelector onPassengerChange={handlePassengerChange} />
                <div className="bottom">
                  <button className="search-flights" onClick={handleSubmit}>
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="main-rightcontent">
          <img src="img/plane.svg" alt="" className="plane" width="110px" />
          <img src="img/cloud.svg" alt="" width="100px" className="cloud" />
          <img src="img/plane.gif" alt="" width="100px" className="plane-gif1" />
          <img src="img/plane.gif" alt="" width="100px" className="plane-gif2" />
          <img
            className="person"
            src="img/test.jpeg"
            alt=""
            width="425px"
          />
          <div className="rating-container">
            <div className="avatars">
              <div className="avatar">
                <img src="img/avatar-2.jpg" alt="Avatar 1" />
              </div>
              <div className="avatar">
                <img src="img/avatar-7.jpeg" alt="Avatar 2" />
              </div>
              <div className="avatar">
                <img src="img/avatar-12.jpg" alt="Avatar 3" />
              </div>
              <div className="avatar">
                <img src="img/avatar-13.jfif" alt="Avatar 4" />
              </div>
            </div>
            <div className="rating-text">
              4.9
              <span className="star">★</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainContent;
