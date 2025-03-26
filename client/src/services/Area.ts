import { area } from "./_axios";

export const fetchAreas = async () => {
    try {
        const response = await area.get('/areas', {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch areas: ${error}`);
        throw error;
    }
};

export const fetchAreaDetail = async (id: number) => {
    try {
        const response = await area.get(`/areas/${id}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch area detail: ${error}`);
        throw error;
    }
};