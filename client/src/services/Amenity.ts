import { amenity } from "./_axios";

export const fetchAmenities = async () => {
    try {
        const response = await amenity.get('/amenities', {
            withCredentials: true
        });
        return response.data.data;
    } catch (error) {
        console.error(`Failed to fetch amenities: ${error}`);
        throw error;
    }
};