import React, { useState, useEffect, useRef, forwardRef } from "react";
import "./AirportSearch.css";

const airports = [
  {
    city: "Ho Chi Minh City",
    code: "SGN",
    country: "Vietnam",
    idairport: 1,
    name: "Tan Son Nhat International Airport",
  },
];

const groupByCountry = (data) => {
  return data.reduce((acc, airport) => {
    const { country } = airport;
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(airport);
    return acc;
  }, {});
};

const AirportSearch = forwardRef(
  (
    {
      airports,
      onSelectAirport,
      type,
      idOther,
      nextInputRef,
      inputRef,
      disabled = false,
      initialValue = null,
    },
    ref
  ) => {
    const [query, setQuery] = useState("");
    const [showList, setShowList] = useState(false);
    const [filteredAirports, setFilteredAirports] = useState({});
    const [countryVisibilityState, setCountryVisibilityState] = useState({});
    const [selected, setSelected] = useState(false);
    const listRef = useRef(null);

    useEffect(() => {
      if (initialValue) {
        handleSelect(initialValue);
      }
    }, []);

    useEffect(() => {
      if (airports && Array.isArray(airports)) {
        const filteredAirports = airports.filter(
          (a) => a.idairport !== idOther
        );
        setFilteredAirports(groupByCountry(filteredAirports));
      }
    }, [idOther, airports]);

    const handleClickOutside = (e) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        listRef.current &&
        !listRef.current.contains(e.target)
      ) {
        setShowList(false);
      }
    };

    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // Group airports by country on initial load
    useEffect(() => {
      if (airports && airports.length > 0) {
        const groupedAirports = groupByCountry(airports);
        setFilteredAirports(groupedAirports);

        const initialVisibilityState = {};
        Object.keys(groupedAirports).forEach((country) => {
          initialVisibilityState[country] = false;
        });
        initialVisibilityState["Vietnam"] = true;
        setCountryVisibilityState(initialVisibilityState);
      }
    }, [airports]);

    const toggleCountryVisibility = (country) => {
      setCountryVisibilityState((prevState) => ({
        ...prevState,
        [country]: !prevState[country],
      }));
    };
    //   console.log(filteredAirports.length())
    const handleSearch = (e) => {
      const searchQuery = e.target.value.toLowerCase();
      setQuery(e.target.value);

      if (selected) {
        setQuery("");
        setSelected(false);
        setFilteredAirports(groupByCountry(airports));
      } else {
        const filtered = airports.filter(
          (airport) =>
            airport.name.toLowerCase().includes(searchQuery) ||
            airport.city.toLowerCase().includes(searchQuery) ||
            airport.country.toLowerCase().includes(searchQuery) ||
            airport.code.toLowerCase().includes(searchQuery)
        );
        setFilteredAirports(groupByCountry(filtered));
      }
    };

    const handleSelect = (idAirport) => {
      if (onSelectAirport) {
        onSelectAirport(type, idAirport);
      }
      const airport = airports.find((a) => a.idairport === idAirport);
      setQuery(airport ? `${airport.city} (${airport.code})` : "");
      setShowList(false);
      setSelected(true);

      if (nextInputRef?.current) {
        nextInputRef.current.focus();
        // nextInputRef.current.click();
      }
    };

    return (
      <div className="airport-search" style={{ position: "relative" }}>
        <input
          type="text"
          name="startAirport"
          placeholder={`${type} Destination`}
          value={query}
          className="input-field"
          onFocus={() => setShowList(true)}
          onChange={handleSearch}
          ref={inputRef}
          disabled={disabled}
        />

        {/* Danh sách hiển thị */}
        {showList && (
          <div className="list-airports" ref={listRef}>
            {Object.keys(filteredAirports).length > 0 ? (
              Object.entries(filteredAirports).map(([country, airports]) => (
                <div key={country} style={{ marginBottom: "10px" }}>
                  <div
                    style={{
                      marginTop: "20px",
                      marginBottom: "20px",
                      cursor: "pointer",
                    }}
                    className="row"
                    onClick={() => toggleCountryVisibility(country)}
                  >
                    <div className="country-cell">
                      {country} ({filteredAirports[country].length})
                    </div>
                    <span
                      className={
                        countryVisibilityState[country] ? "rotated" : ""
                      }
                    >
                      <svg width="12" height="6" viewBox="0 0 12 6" fill="none">
                        <path
                          opacity="0.9"
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M0 0L6 6L12 0L0 0Z"
                          fill="#333333"
                        ></path>
                      </svg>
                    </span>
                  </div>

                  {/* {countryVisibilityState[country] ? ( */}
                  <div
                    className={
                      countryVisibilityState[country]
                        ? "airport-list show"
                        : "airport-list"
                    }
                  >
                    {airports.map((airport) => (
                      <div
                        key={airport.idairport}
                        style={{
                          paddingTop: "15px",
                          paddingBottom: "15px",
                          cursor: "pointer",
                          borderBottom: "1px solid #ddd",
                          fontSize: "16px",
                        }}
                        onClick={() => handleSelect(airport.idairport)}
                      >
                        <div className="row">
                          <div>{airport.city}</div>
                          <div style={{ fontWeight: "bold" }}>
                            {airport.code}
                          </div>
                        </div>
                        <div className="city-cell">{airport.name}</div>
                      </div>
                    ))}
                  </div>
                  {/* ) : null */}
                  {/* } */}
                </div>
              ))
            ) : (
              <div style={{ padding: "8px" }}>No airports found</div>
            )}
          </div>
        )}
      </div>
    );
  }
);

export default AirportSearch;
