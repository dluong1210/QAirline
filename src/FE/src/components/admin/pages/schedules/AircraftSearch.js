import React, { useState, useEffect, useRef, forwardRef } from "react";
import "components/MainContent/AirportSearch.css"; // We can reuse the same CSS
import { searchFilter } from "utils/filter/searchFilter";

const AircraftSearch = forwardRef(({ airplanes, onSelectAircraft, inputRef, disabled, initialValue }, ref) => {
  const [query, setQuery] = useState("");
  const [showList, setShowList] = useState(false);
  const [filteredAirplanes, setFilteredAirplanes] = useState([]);
  const [selected, setSelected] = useState(false);
  const listRef = useRef(null);

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

  useEffect(() => {
    if (airplanes && airplanes.length > 0) {
      setFilteredAirplanes(airplanes);
    }
  }, [airplanes]);

  const handleSearch = (e) => {
    const searchQuery = e.target.value.toLowerCase();
    setQuery(e.target.value);
    
    if (selected) {
      setQuery("");
      setSelected(false);
      setFilteredAirplanes(airplanes);
    } else {
      const filtered = airplanes.filter(
        (airplane) => searchFilter(airplane, searchQuery)
      );
      setFilteredAirplanes(filtered);
    }
  };

  const handleSelect = (airplaneId) => {
    
    const airplane = airplanes.find((a) => a.idAirplane === airplaneId);
    if (onSelectAircraft && airplane) {
      onSelectAircraft(airplane);
    }
    setQuery(airplane ? `${airplane.code} (${airplane.type}) - Capacity: ${airplane.capacity}` : "");
    setShowList(false);
    setSelected(true);
  };

  useEffect(() => {
    if (initialValue) {
      handleSelect(initialValue);
    }
  }, [])

  return (
    <div className="airport-search" style={{ position: "relative" }}>
      <input
        type="text"
        name="airplane"
        placeholder="Select Aircraft"
        value={query}
        className="input-field"
        onFocus={() => setShowList(true)}
        onChange={handleSearch}
        ref={inputRef}
        disabled={disabled}
      />

      {showList && (
        <div className="list-airports" ref={listRef}>
          {filteredAirplanes.length > 0 ? (
            filteredAirplanes.map((airplane) => (
              <div
                key={airplane.id}
                style={{
                  paddingTop: "15px",
                  paddingBottom: "15px",
                  cursor: "pointer",
                  borderBottom: "1px solid #ddd",
                  fontSize: "16px",
                }}
                onClick={() => handleSelect(airplane.idAirplane)}
              >
                <div className="row">
                  <div style={{ fontWeight:"400"}}>{airplane.type}</div>
                  <div style={{ fontWeight: "bold" }}>{airplane.code}</div>
                </div>
                <div className="row" style={{ paddingTop:"2px" }}>
                    <div className="city-cell" style={{ fontSize:"0.8em" }}>Capacity: {airplane.capacity}</div>
                    <div style={{ backgroundColor: "#E8F5E9", color: "#2E7D32", padding:"2px", borderRadius:"4px" }}>{airplane.status}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: "8px" }}>No aircraft found</div>
          )}
        </div>
      )}
    </div>
  );
});

export default AircraftSearch;
