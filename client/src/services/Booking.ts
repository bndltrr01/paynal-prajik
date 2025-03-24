import { booking } from "./_axios";

export const fetchBookings = async () => {
    try {
        const response = await booking.get('/bookings', {
            withCredentials: true
        });
        return response.data.data;
    } catch (error) {
        console.error(`Failed to fetch bookings: ${error}`);
        throw error;
    }
};

export const fetchReservations = async () => {
    try {
        const response = await booking.get('/reservation', {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch reservations: ${error}`);
        throw error;
    }
};

export const fetchAvailability = async (arrival: string, departure: string) => {
    try {
        const response = await booking.get('/availability', {
            params: { arrival, departure },
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch availability: ${error}`);
        throw error;
    }
};

export interface BookingFormData {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    emailAddress: string;
    address: string;
    specialRequests?: string;
    roomId: string | null;
    checkIn: string | null;
    checkOut: string | null;
    status?: string;
}

export const createBooking = async (bookingData: BookingFormData) => {
    try {
        const dataToSend = {
            ...bookingData,
            status: bookingData.status || 'pending'
        };
        
        const response = await booking.post('/bookings', dataToSend, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error(`Failed to create booking: ${error}`);
        throw error;
    }
};

export const fetchRoomById = async (roomId: string) => {
    try {
        const response = await booking.get(`/rooms/${roomId}`, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch room details: ${error}`);
        throw error;
    }
};

export const fetchBookingDetail = async (bookingId: string) => {
    try {
        const response = await booking.get(`/bookings/${bookingId}`, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        });
        return response.data.data;
    } catch (error) {
        console.error(`Failed to fetch booking details: ${error}`);
        throw error;
    }
};

export const fetchUserBookings = async () => {
    try {
        const response = await booking.get('/user/bookings', {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        });
        return response.data.data;
    } catch (error) {
        console.error(`Failed to fetch user bookings: ${error}`);
        throw error;
    }
};

export const cancelBooking = async (bookingId: string, reason: string) => {
    try {
        const response = await booking.post(`/bookings/${bookingId}/cancel`, 
            { reason }, 
            {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to cancel booking: ${error}`);
        throw error;
    }
};