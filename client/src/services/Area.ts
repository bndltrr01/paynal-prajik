import { area } from "./_axios";

interface Area {
  id: number;
  area_name: string;
  description: string;
  area_image: string;
  status: string;
  capacity: number;
  price_per_hour: string;
}

interface AreasResponse {
  data: Area[];
}

export const fetchAreas = async (): Promise<AreasResponse> => {
  try {
    const response = await area.get("/areas", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching areas:", error);
    throw error;
  }
};

export const fetchAreaDetail = async (id: number) => {
  try {
    const response = await area.get(`/areas/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch area detail: ${error}`);
    throw error;
  }
};
