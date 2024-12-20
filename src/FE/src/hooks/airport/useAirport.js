import { BACKEND_BASE_URL } from "services/api";

export const useAirport = () => {
    const getAllAirports = async () => {
        try {
            const res = await fetch(`${BACKEND_BASE_URL}/airport/`, {
              method: "GET",
            });
            if (res.ok) {
              const result = await res.json();
              return result;
            } else {
              throw new Error("Failed to fetch airport data!");
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    return {
      getAllAirports,
    }
}