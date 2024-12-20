import { BACKEND_BASE_URL } from "services/api";

export const useFlight = () => {
    const getAllFlights = async () => {
        const response = await fetch(`${BACKEND_BASE_URL}/flight`, {
            credentials: 'include',
        });
        const data = await response.json();
        return data;
    }

    const getAllFlightsAdmin = async () => {
        const response = await fetch(`${BACKEND_BASE_URL}/flight/adminAll`, {
            credentials: 'include',
        });
        const data = await response.json();
        return data;
    }

    const createFlight = async (flight) => {
        const response = await fetch(`${BACKEND_BASE_URL}/flight/createFlight`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(flight),
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error("Error creating flight.")
        }
        const data = await response.json();
        return data;
    }

    const getFlightById = async (idFlight) => {
        const response = await fetch(`${BACKEND_BASE_URL}/flight/getInfo?` + new URLSearchParams({
            idFlight: idFlight,
        }).toString())
        if (!response.ok) {
            throw new Error(`Error fetching flightId: ${idFlight}`)
        }
        const data = await response.json();
        return data;
    }

    const getFlightByIdAdmin = async (idFlight) => {
        const response = await fetch(`${BACKEND_BASE_URL}/flight/getInfoAdmin?` + new URLSearchParams({
            idFlight: idFlight,
        }).toString(), {
            credentials: 'include',
        })
        if (!response.ok) {
            throw new Error(`Error fetching flightId: ${idFlight}`)
        }
        const data = await response.json();
        return data;
    }

    const changeInfoFlight = async (flight) => {
        const response = await fetch(`${BACKEND_BASE_URL}/flight/changeInfo`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(flight),
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error("Error updating flight.")
        }
        const data = await response.json();
        return data;
    }

    const deleteFlight = async (idFlight) => {
        const response = await fetch(`${BACKEND_BASE_URL}/flight/?` + new URLSearchParams({
            idFlight: idFlight,
        }).toString(), {
            method: 'DELETE',
            credentials: 'include',
        })
        if (!response.ok) {
            throw new Error("Error deleting flight.")
        }
        const data = await response.text();
        return data;
    }

    return {
        getAllFlights,
        getAllFlightsAdmin,
        getFlightById,
        getFlightByIdAdmin,
        createFlight,
        changeInfoFlight,
        deleteFlight
    }
}