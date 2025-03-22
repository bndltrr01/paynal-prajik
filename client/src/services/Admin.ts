/* eslint-disable @typescript-eslint/no-explicit-any */
import { ADMIN } from "./_axios";

export const fetchAdminProfile = async () => {
  try {
    const response = await ADMIN.get("/details", {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error(`Failed to fetch admin profile: ${error}`);
    throw error;
  }
};

export const fetchStats = async () => {
  try {
    const response = await ADMIN.get("/stats", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch stats: ${error}`);
    throw error;
  }
};

export const areaReservations = async () => {
  try {
    const response = await ADMIN.get("/area_reservations", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch area reservations: ${error}`);
    throw error;
  }
};

export const manageUsers = async () => {
  try {
    const response = await ADMIN.get("/manage_users", {
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch users: ${error}`);
    throw error;
  }
};

// CRUD Rooms
export const fetchRooms = async () => {
  try {
    const response = await ADMIN.get("/rooms", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch rooms: ${error}`);
    throw error;
  }
};

export const addNewRoom = async (payload: FormData): Promise<{ data: any }> => {
  try {
    const response = await ADMIN.post("/add_room", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch areas: ${error}`);
    throw error;
  }
};

export const roomDetail = async (roomId: number) => {
  try {
    const response = await ADMIN.get(`/show_room/${roomId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch room detail: ${error}`);
    throw error;
  }
}

export const editRoom = async (
  roomId: number,
  payload: FormData
): Promise<{ data: any }> => {
  try {
    const response = await ADMIN.put(`/edit_room/${roomId}`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to edit room: ${error}`);
    throw error;
  }
};

export const deleteRoom = async (roomId: number) => {
  try {
    const response = await ADMIN.delete(`/delete_room/${roomId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to delete room: ${error}`);
    throw error;
  }
};

// CRUD Areas
export const fetchAreas = async () => {
  try {
    const response = await ADMIN.get("/areas", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch areas: ${error}`);
    throw error;
  }
}

export const addNewArea = async (payload: FormData): Promise<{ data: any }> => {
  try {
    const response = await ADMIN.post("/add_area", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to add area: ${error}`);
    throw error;
  }
}

export const areaDetail = async (areaId: number) => {
  try {
    const response = await ADMIN.get(`/show_area/${areaId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch area detail: ${error}`);
    throw error;
  }
}

export const editArea = async (areaId: number, payload: FormData): Promise<{ data: any }> => {
  try {
    const response = await ADMIN.put(`/edit_area/${areaId}`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to edit area: ${error}`);
    throw error;
  }
}

export const deleteArea = async (areaId: number) => {
  try {
    const response = await ADMIN.delete(`/delete_area/${areaId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to delete area: ${error}`);
    throw error;
  }
}