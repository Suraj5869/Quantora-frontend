import axiosInstance from "../../../api/axios";
import type { Profile, UpdateProfileRequest } from "../types/profile.types";

export const getProfile = async (): Promise<Profile> => {
  const response = await axiosInstance.get<Profile>("/profile");

  return response.data;
};

export const updateProfile = async (
  data: UpdateProfileRequest,
): Promise<Profile> => {
  const response = await axiosInstance.put<Profile>("/profile", data);

  return response.data;
};
