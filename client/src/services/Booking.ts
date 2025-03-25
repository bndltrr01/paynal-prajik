import { booking } from "./_axios";

export interface BookingResponse {
    id: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        profile_image?: string;
        address?: string;
        phone_number?: string;
    };
    room_details: {
        id: number;
        room_name: string;
        room_type: string;
        room_price: string;
        room_image?: string;
        description?: string;
        capacity?: number;
        amenities?: Array<{
            id: number;
            description: string;
        }>;
    };
    check_in_date: string;
    check_out_date: string;
    status: string;
    created_at: string;
    updated_at: string;
    cancellation_reason?: string;
}

export const fetchBookings = async (): Promise<{ data: BookingResponse[] }> => {
    try {
        const response = await booking.get('/bookings', {
            withCredentials: true
        });
        console.log('Bookings response:', response.data);
        return response.data;
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
    status?: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out';
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
        return response.data.data;
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