import { isAxiosError } from "axios";
import { MaterialResponse } from "../types/material";
import api from "../configs/axios";

const handleApiError = (error: unknown, defaultMessage: string): never => {
  if (isAxiosError(error) && error.response) {
    const responseData = error.response.data;
    if (responseData?.message) throw new Error(responseData.message);
    if (responseData?.error) throw new Error(responseData.error);
  }
  throw new Error(defaultMessage);
};


export const getPublicMaterials = async (
  params?: Record<string, any>
): Promise<MaterialResponse> => {
  try {
    const response = await api.get<MaterialResponse>(
      "/learning-materials",
      { params }
    );
    return response.data;
  } catch (error: unknown) {
    return handleApiError(error, "Failed to fetch public materials");
  }
};
