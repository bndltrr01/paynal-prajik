import { reservation } from "./_axios";

export const fetchReservations = async () => {
    try {
        const response = await reservation.get('/reservations', {
            withCredentials: true
        });
        return response;
    } catch (error) {
        console.error(`Failed to fetch reservations: ${error}`);
        throw error;
    }
};