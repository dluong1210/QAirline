import "./MyFlights.css";
import { useEffect, useState } from "react";
import { LoadState } from "types/states/LoadState";

import ListTicket from "components/ticket/ListTicket.js";
import Notification from "components/Notification/Notification.js";
import { formatDate } from "utils/date/formatDate";
import { BACKEND_BASE_URL } from "services/api";
import { useAuth } from "contexts/AuthContext";

export const TicketComponent = ({ ticket }) => {
  const { user } = useAuth();
  const string = ticket.code;
  const seat = string.split("-").pop();
  return (
    <div className="ticket-container">
      <div key={ticket.idTicket} className="ticket">
        <div className="ticket-header">
          <img src="img/LOGO.png" style={{ width: "100px" }} />
          <div className="title-ticket" style={{ background: "red", padding: "10px 30px", borderRadius: "10px", color: "white", fontWeight: "600"}}>{ticket.status}</div>
        </div>
        <div className="ticket-details">
          <div className="flight-info">
            <div>
              <h4>ID FLIGHT:</h4>
              <p>QA{ticket.ClassFlight.Flight.idFlight}</p>
            </div>
            <div>
              <img
                src="img/mavach.png"
                style={{ height: "60px", width: "400px" }}
              />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <h4>FROM:</h4>
                <p>{ticket.ClassFlight.Flight.beginAirport.name}</p>
                <p>({ticket.ClassFlight.Flight.beginAirport.code})</p>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <h4>TO:</h4>
                <p>{ticket.ClassFlight.Flight.endAirport.name}</p>
                <p>({ticket.ClassFlight.Flight.endAirport.code})</p>
              </div>
            </div>
          </div>
          <div className="time-info">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "37%",
              }}
            >
              <div>
                <h4>DEPARTURE:</h4>
                <p>{formatDate(ticket.ClassFlight.Flight.timeStart)}</p>
              </div>
              <div>
                <h4>ARRIVAL:</h4>
                <p>{formatDate(ticket.ClassFlight.Flight.timeEnd)}</p>
              </div>
              <div>
                <h4>SEAT:</h4>
                <p>{seat}</p>
              </div>
              <div>
                <h4>GATE:</h4>
                <p>G22</p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "29.5%",
              }}
            >
              <div>
                <h4>NAME:</h4>
                <p>
                  {user.username}
                  {/* {document.getElementById("last-name").value}{" "}
                  {document.getElementById("first-name").value} */}
                </p>
              </div>
              <div>
                <h4>CLASS:</h4>
                <p>{ticket.ClassFlight.class}</p>
              </div>
              <div className="price-info">
                <h4>PRICE:</h4>
                <p>{ticket.price.toLocaleString()} VND</p>
              </div>
            </div>
          </div>
        </div>
        <div className="seat-info">
          <p>
            Seats Booked: {ticket.ClassFlight.seatBooked} /{" "}
            {ticket.ClassFlight.seatAmount}
          </p>
        </div>
        <div className="ticket-header">
          <h4 className="title-ticket" style={{ fontWeight: "500" }}>
            The boarding gate closes 15 minutes before departure time.
          </h4>
          <h4>Hotline: 1900 9099</h4>
        </div>
      </div>
    </div>
  );
};

function MyFlight() {
  const [view, setView] = useState("form");

  const [code, setCode] = useState("");
  const [tickets, setTickets] = useState([]);
  const [myticket, setMyTicket] = useState();
  const [showTicket, setShowTicket] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState("Error.");
  const [loadState, setLoadState] = useState(LoadState.LOADING);

  const getAllTickets = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/user/getTickets/`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        setTickets(result);
      }
      setLoadState(LoadState.SUCCESS);
    } catch (err) {
      console.error(err);
      setLoadState(LoadState.ERROR);
    }
  };

  const handleSearch = async () => {
    try {
      setLoadState(LoadState.LOADING);
      const response = await fetch(
        `${BACKEND_BASE_URL}/booking/getTicketByCode?code=${code}`,
        {
          method: "GET",
          //   credentials: "include",
        }
      );

      if (response.ok) {
        const result = await response.json();
        setMyTicket(result);
        setShowTicket(true);
        window.scrollTo(0, 430);
      } else if (response.status === 404) {
        setNotification("No tickets have been found.");
        setShowNotification(true);
        setShowTicket(false);
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      }
      setLoadState(LoadState.SUCCESS);
    } catch (err) {
      console.error(err);
      setLoadState(LoadState.ERROR);
    }
  };

  return (
    <main>
      <div className="myflights-container">
        <Notification
          message={notification}
          show={showNotification}
          isSuccessful={notification === "Delete ticket successfully."} //Magic string =)))).
        />
        <div className="content">
          <div className="toprow-myflights">
            <button
              className={`search-codemyflights ${
                view === "form" ? "active-flightoption" : ""
              }`}
              onClick={() => setView("form")}
            >
              <div className="inside-codemyflights">
                <i className="fa-solid fa-calendar-check"></i>
                Search ticket code
              </div>
            </button>
            <button
              className={`search-myflights ${
                view === "noCode" ? "active-flightoption" : ""
              }`}
              onClick={() => {
                setView("noCode");
                setShowTicket(false);
                setCode("");
                getAllTickets();
              }}
            >
              <div className="inside-myflights">
                <i className="fa-solid fa-calendar-check"></i>
                My booked flights
              </div>
            </button>
          </div>

          {view === "form" ? (
            <div className="bottomrow-myflights">
              <div className="flight-form">
                <h2>MY BOOKED TICKETS</h2>
                <p>
                  If you want to view your booked ticket, change your flight
                  schedule, or purchase additional services like baggage, seat
                  selection, or meals, please fill in the information below:
                </p>
                <div className="form-myflight">
                  <div className="input-group">
                    <input
                      type="text"
                      id="booking-code"
                      name="booking-code"
                      placeholder="Ticket code *"
                      required
                      onChange={(event) => setCode(event.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      id="last-name"
                      name="last-name"
                      placeholder="Last name *"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      id="first-name"
                      name="first-name"
                      placeholder="First name *"
                      required
                    />
                  </div>
                  <button className="search" onClick={handleSearch}>
                    Search Your Ticket
                  </button>
                </div>
              </div>
              <div className="myflight-image">
                <img src="./img/plane.jpeg" alt="Flight image" />
              </div>
            </div>
          ) : (
            <div className="history-container">
              {/* <div className="tabs">
                <button className="tab active">All flights (0)</button>
                <button className="tab">Unpaid flights (0)</button>
                <button className="tab">Coming fights (0)</button>
              </div> */}

              {tickets.length !== 0 ? (
                <ListTicket
                  rawTickets={tickets}
                  setShowNotification={setShowNotification}
                  setNotification={setNotification}
                />
              ) : (
                <div className="empty-state">
                  <svg
                    width="190"
                    height="106"
                    viewBox="0 0 190 106"
                    fill="none"
                    style={{ marginBottom: "20px" }}
                  >
                    <g opacity="0.7">
                      <path
                        d="M116.413 8.03856L11.7871 60.4157L29.8274 96.5002L134.453 44.123L116.413 8.03856Z"
                        fill="#CECECE"
                      ></path>
                      <path
                        d="M116.414 8.03966L94.5605 18.9797L112.601 55.0642L134.454 44.1241L116.414 8.03966Z"
                        fill="#E1E1E1"
                      ></path>
                      <path
                        d="M94.5645 18.9885L112.604 55.0727"
                        stroke="white"
                        stroke-width="1.1691"
                        stroke-miterlimit="10"
                        strokeDasharray="6.62 6.62"
                      ></path>
                      <path
                        d="M89.6012 27.6172L55.6074 44.6349L56.5637 46.5477L90.5575 29.53L89.6012 27.6172Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M91.6491 31.7222L57.6582 48.7385L58.6145 50.6514L92.6054 33.635L91.6491 31.7222Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M93.7008 35.8151L59.707 52.8329L60.6633 54.7457L94.6571 37.728L93.7008 35.8151Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M95.7496 39.9194L61.7559 56.9371L62.7122 58.85L96.7059 41.8322L95.7496 39.9194Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M97.8159 44.0286L63.8184 61.0464L64.7747 62.9594L98.7722 45.9417L97.8159 44.0286Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M99.8512 48.1187L65.8574 65.1365L66.8137 67.0493L100.807 50.0316L99.8512 48.1187Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M92.0352 57.174L67.918 69.2461L68.8743 71.1592L92.9915 59.0871L92.0352 57.174Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M51.109 68.0009C51.5756 67.1302 51.5409 66.2974 50.986 66.1112C50.5415 65.9661 50.1159 66.3384 49.8857 66.9819L47.3983 64.9187C47.8775 64.0354 47.846 63.1931 47.2817 63.0038C46.8308 62.8555 46.4021 63.2372 46.1719 63.8997L43.8862 62.0037C45.9197 56.1075 46.1971 51.4542 44.2551 50.8012C42.3131 50.1607 39.75 54.0506 37.8395 59.9847L34.8791 60.1298C35.0903 59.461 34.9768 58.8994 34.5292 58.7512C33.9585 58.5619 33.432 59.2149 33.287 60.2118L30.0555 60.3727C30.2573 59.7165 30.1407 59.1676 29.7025 59.0162C29.1413 58.83 28.6116 59.4704 28.4666 60.4516L24.4186 60.6535L21.0957 62.0605L36.4523 65.2721C36.4271 65.3856 36.3987 65.4929 36.3766 65.6128C35.5096 69.8717 34.8003 73.7552 34.3432 76.6828L27.8203 80.3077L33.8135 80.7052C33.7599 81.3298 33.7536 81.7525 33.8041 81.9324C33.8072 81.9418 33.8104 81.945 33.8135 81.9544C33.8261 81.9955 33.8419 82.0238 33.864 82.0302C33.9711 82.0649 34.2612 81.6957 34.6994 80.9985L39.731 84.2795L36.6856 77.4652C38.0727 74.8468 39.8382 71.3134 41.692 67.3858C41.7424 67.2785 41.7866 67.1744 41.8339 67.0703L47.2627 69.6067L56.0492 73.711L54.2333 70.591L51.109 68.0009Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M127.298 32.5175L109.266 41.5437L113.025 49.0633L131.057 40.0372L127.298 32.5175Z"
                        fill="white"
                      ></path>
                      <path
                        d="M118.203 37.894L117.645 38.1735L120.592 44.0672L121.15 43.7877L118.203 37.894Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M117.004 38.5076L116.443 38.7884L118.621 43.145L119.182 42.8641L117.004 38.5076Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M115.803 39.1093L115.242 39.3901L118.188 45.2844L118.749 45.0036L115.803 39.1093Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M114.613 39.7023L114.055 39.9818L117.001 45.8761L117.56 45.5966L114.613 39.7023Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M113.412 40.3024L112.854 40.5819L115.368 45.6129L115.927 45.3334L113.412 40.3024Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M112.2 40.8917L111.639 41.1726L114.585 47.0663L115.146 46.7854L112.2 40.8917Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M111.018 41.5018L110.457 41.7827L112.547 45.9643L113.109 45.6834L111.018 41.5018Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M126.78 33.6114L126.219 33.8923L129.165 39.7866L129.726 39.5058L126.78 33.6114Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M125.573 34.2111L125.012 34.4921L127.19 38.8482L127.751 38.5672L125.573 34.2111Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M124.374 34.8085L123.812 35.0894L126.76 40.9831L127.321 40.7022L124.374 34.8085Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M123.17 35.4119L122.611 35.6913L125.557 41.5857L126.116 41.3063L123.17 35.4119Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M121.961 36.0169L121.402 36.2964L123.917 41.3268L124.476 41.0473L121.961 36.0169Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M120.772 36.623L120.211 36.9038L123.157 42.7982L123.718 42.5174L120.772 36.623Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M119.573 37.2187L119.012 37.4995L121.102 41.6812L121.663 41.4003L119.573 37.2187Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M133.075 58.6187H16.0801V98.9681H133.075V58.6187Z"
                        fill="#CECECE"
                      ></path>
                      <path
                        d="M133.074 58.6187H108.635V98.9681H133.074V58.6187Z"
                        fill="#E1E1E1"
                      ></path>
                      <path
                        d="M108.635 58.6187V98.9681"
                        stroke="white"
                        stroke-width="1.1691"
                        stroke-miterlimit="10"
                        strokeDasharray="6.62 6.62"
                      ></path>
                      <path
                        d="M100.338 64.1237H62.3262V66.2626H100.338V64.1237Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M100.338 68.7076H62.3262V70.8465H100.338V68.7076Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M100.338 73.2915H62.3262V75.4304H100.338V73.2915Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M100.338 77.8785H62.3262V80.0174H100.338V77.8785Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M100.338 82.4623H62.3262V84.6013H100.338V82.4623Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M100.338 87.0494H62.3262V89.1883H100.338V87.0494Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M89.2908 91.6332H62.3262V93.7722H89.2908V91.6332Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M47.8595 82.9987C48.6697 82.4277 49.0071 81.6674 48.5909 81.2541C48.2567 80.926 47.7113 81.068 47.2195 81.5412L45.9175 78.582C46.7403 78.0079 47.0903 77.2412 46.6678 76.8185C46.3305 76.4841 45.7756 76.6355 45.2775 77.1214L44.0795 74.402C48.531 70.0389 50.8608 66.0008 49.4169 64.5496C47.9667 63.1079 43.9376 65.4393 39.5712 69.8907L36.8568 68.695C37.3454 68.1934 37.4936 67.6381 37.1626 67.3037C36.7369 66.8779 35.974 67.228 35.3971 68.0546L32.4367 66.7517C32.9096 66.2564 33.0546 65.7106 32.7268 65.3793C32.3075 64.9629 31.5508 65.2973 30.9802 66.1081L27.2695 64.4771L23.6692 64.2499L35.9677 73.995C35.892 74.0865 35.8227 74.1685 35.747 74.2631C33.0673 77.6829 30.6965 80.8408 28.9783 83.2542L21.5254 83.576L26.7084 86.614C26.3805 87.1503 26.1882 87.5226 26.1503 87.7087H26.1472C26.1472 87.7182 26.1472 87.7245 26.1472 87.7308C26.144 87.775 26.144 87.8065 26.1598 87.8223C26.2386 87.9012 26.6674 87.6993 27.3673 87.2734L30.4001 92.4598L30.7217 85.002C33.1335 83.2826 36.2924 80.9134 39.7068 78.2287C39.7982 78.1561 39.8865 78.0836 39.9747 78.0078L43.6949 82.7085L49.7196 90.3146L49.4894 86.7118L47.8595 82.9987Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M131.853 85.3679H111.691V93.7754H131.853V85.3679Z"
                        fill="white"
                      ></path>
                      <path
                        d="M121.316 86.1124H120.691V92.7027H121.316V86.1124Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M119.977 86.1124H119.35V90.9834H119.977V86.1124Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M118.637 86.1124H118.01V92.7027H118.637V86.1124Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M117.294 86.1124H116.67V92.7027H117.294V86.1124Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M115.954 86.1124H115.33V91.7374H115.954V86.1124Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M114.614 86.1124H113.986V92.7027H114.614V86.1124Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M113.271 86.1124H112.646V90.7878H113.271V86.1124Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M130.897 86.1124H130.27V92.7027H130.897V86.1124Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M129.557 86.1124H128.93V90.9834H129.557V86.1124Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M128.213 86.1124H127.586V92.7027H128.213V86.1124Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M126.87 86.1124H126.246V92.7027H126.87V86.1124Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M125.534 86.1124H124.906V91.7374H125.534V86.1124Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M124.192 86.1124H123.564V92.7027H124.192V86.1124Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M122.852 86.1124H122.225V90.7878H122.852V86.1124Z"
                        fill="#939393"
                      ></path>
                      <path
                        opacity="0.1"
                        d="M118.092 34.2302C115.746 37.6783 114.879 41.83 115.648 45.9154C117.244 54.3859 125.431 59.9762 133.896 58.3767C138.001 57.6038 141.56 55.2661 143.921 51.7927C146.264 48.3477 147.128 44.1992 146.355 40.117C145.586 36.0189 143.256 32.4635 139.804 30.1069C136.352 27.7471 132.197 26.8764 128.101 27.6493C124.003 28.4254 120.447 30.7631 118.092 34.2302Z"
                        fill="white"
                      ></path>
                      <path
                        d="M143.076 52.9283C143.221 52.758 143.357 52.5782 143.495 52.3952C143.357 52.5782 143.218 52.7548 143.076 52.9283Z"
                        fill="#EC2029"
                      ></path>
                      <path
                        d="M143.521 52.3574C143.66 52.1776 143.789 51.9883 143.922 51.7958C143.793 51.9851 143.66 52.1744 143.521 52.3574Z"
                        fill="#EC2029"
                      ></path>
                      <path
                        opacity="0.6"
                        d="M118.092 34.2301C120.198 31.1353 123.259 28.9396 126.812 27.9521C126.118 28.1446 125.444 28.3875 124.791 28.6714C123.262 29.7472 121.925 31.0943 120.844 32.6874C118.501 36.1356 117.634 40.2873 118.404 44.3758C119.999 52.8432 128.186 58.4335 136.651 56.8371C137.805 56.6195 138.918 56.2756 139.968 55.8213C141.112 55.0168 142.149 54.0547 143.054 52.9568C140.728 55.7866 137.525 57.6952 133.899 58.3798C125.431 59.9793 117.247 54.389 115.651 45.9185C114.876 41.8299 115.746 37.6783 118.092 34.2301Z"
                        fill="white"
                      ></path>
                      <path
                        d="M127.271 27.8322C127.379 27.8102 127.483 27.7818 127.593 27.7565C127.483 27.7818 127.379 27.807 127.271 27.8322Z"
                        fill="#EC2029"
                      ></path>
                      <path
                        d="M127.691 27.7345C127.827 27.7061 127.959 27.6777 128.101 27.6493C127.963 27.6777 127.827 27.7061 127.691 27.7345Z"
                        fill="#EC2029"
                      ></path>
                      <path
                        d="M153.517 58.4777C152.682 59.7017 151.011 60.0172 149.788 59.178L145.85 56.4113C144.63 55.5721 144.311 53.9033 145.144 52.6792C145.144 52.6792 145.147 52.676 145.15 52.6729C145.985 51.4488 147.653 51.1302 148.88 51.9694L152.811 54.7393C154.034 55.5721 154.349 57.241 153.517 58.4682C153.523 58.4682 153.517 58.4745 153.517 58.4777Z"
                        fill="#B1B1B1"
                      ></path>
                      <path
                        d="M110.37 46.9091C112.52 58.2947 123.519 65.8093 134.891 63.6609C140.411 62.6167 145.197 59.4777 148.359 54.8181C151.509 50.1869 152.669 44.6125 151.632 39.12C150.594 33.615 147.47 28.8355 142.832 25.6681C138.195 22.5039 132.608 21.3303 127.107 22.3682C121.59 23.4125 116.81 26.5483 113.642 31.2047C110.496 35.8422 109.332 41.4199 110.37 46.9091ZM115.647 45.9154C114.875 41.83 115.745 37.6783 118.09 34.2302C120.449 30.7631 124.002 28.4254 128.103 27.6493C132.199 26.8764 136.354 27.7471 139.806 30.1069C143.258 32.4635 145.588 36.0189 146.357 40.1169C147.126 44.1992 146.266 48.3477 143.923 51.7927C141.562 55.2661 138.003 57.6038 133.898 58.3767C125.43 59.9762 117.242 54.3859 115.647 45.9154Z"
                        fill="#CECECE"
                      ></path>
                      <path
                        d="M113.201 46.376C115.054 56.1999 124.547 62.6829 134.358 60.8279C139.119 59.9257 143.249 57.2189 145.979 53.1997C145.979 53.1997 145.979 53.1997 145.979 53.1966C148.696 49.1995 149.699 44.3916 148.804 39.6532C147.908 34.9021 145.213 30.7788 141.212 28.05C137.211 25.318 132.391 24.3053 127.646 25.2012C122.886 26.1035 118.765 28.8103 116.032 32.8263C113.308 36.8265 112.308 41.6407 113.201 46.376ZM115.647 45.9154C114.875 41.83 115.745 37.6783 118.09 34.2302C120.449 30.7631 124.002 28.4254 128.103 27.6493C132.199 26.8796 136.354 27.7471 139.806 30.1069C143.258 32.4635 145.588 36.0189 146.357 40.1169C147.13 44.1992 146.266 48.3477 143.923 51.7927C141.559 55.2661 138.003 57.6038 133.895 58.3767C125.43 59.9762 117.242 54.3891 115.647 45.9154Z"
                        fill="#B1B1B1"
                      ></path>
                      <path
                        d="M148.094 61.2791L154.169 52.348L182.136 71.3712L176.064 80.3086L148.094 61.2791Z"
                        fill="#B1B1B1"
                      ></path>
                      <path
                        d="M149.355 59.4272L152.912 54.1967L180.879 73.223L177.326 78.4568L149.355 59.4272Z"
                        fill="#939393"
                      ></path>
                      <path
                        d="M171.777 77.3905L177.853 68.4562L182.137 71.3712L176.065 80.3086L171.777 77.3905Z"
                        fill="#B1B1B1"
                      ></path>
                      <path
                        d="M176.585 70.3133L173.029 75.5463L177.318 78.4644L180.874 73.2314L176.585 70.3133Z"
                        fill="#B1B1B1"
                      ></path>
                      <path
                        opacity="0.6"
                        d="M135.891 30.782C131.875 29.6684 127.666 30.1794 124.047 32.2206C122.786 32.9304 121.669 33.7916 120.695 34.7601L122.401 37.5521C123.514 36.2965 124.847 35.205 126.389 34.3343C130.008 32.2931 134.217 31.782 138.234 32.8957C140.084 33.4099 141.821 34.2806 143.328 35.3816C141.358 33.1859 138.804 31.5928 135.891 30.782Z"
                        fill="white"
                      ></path>
                    </g>
                  </svg>
                  <p>Don't find any booking flights</p>
                </div>
              )}
            </div>
          )}
          {showTicket && <TicketComponent ticket={myticket} />}
        </div>
      </div>
    </main>
  );
}

export default MyFlight;
