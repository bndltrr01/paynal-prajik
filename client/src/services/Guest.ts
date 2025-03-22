import { guest } from "./_axios";

export const getGuestDetails = async (id: string) => {
    try {
        const { data } = await guest.get(`/${id}`, {
            withCredentials: true
        });
        return data;
    } catch (error) {
        console.error(`Failed to fetch guest details: ${error}`);
        throw error;
    }
};

export const updateGuestDetails = async (id: string, data: string[]) => {
    try {
        const response = await guest.put(`/${id}`, {
            data: data
        }, {
            withCredentials: true,
        });
        return response;
    } catch (error) {
        console.error(`Failed to update guest details: ${error}`);
        throw error;
    }
};

export const updateProfileImage = async (formData: FormData) => {
    try {
        const response = await guest.put("/change_image", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true,
        });
        return response;
    } catch (error) {
        console.error(`Failed to update profile image: ${error}`);
        throw error;
    }
};