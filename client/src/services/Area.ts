import { area } from "./_axios";

export const fetchAreas = async () => {
    try {
        const response = await area.get('/areas', {
            withCredentials: true
        });
        return response.data.data;
    } catch (error) {
        console.error(`Failed to fetch areas: ${error}`);
    }
};
