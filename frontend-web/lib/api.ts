import axios from "axios";
import { getAuthToken } from "./auth";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://bantuhub-production.up.railway.app/api",
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function getJson<T>(url: string, params?: Record<string, string | number | undefined>) {
  const response = await api.get<ApiResponse<T>>(url, { params });
  return response.data;
}

export async function postJson<T, P = unknown>(url: string, payload: P) {
  const response = await api.post<ApiResponse<T>>(url, payload);
  return response.data;
}

export async function putJson<T, P = unknown>(url: string, payload?: P) {
  const response = await api.put<ApiResponse<T>>(url, payload);
  return response.data;
}

export async function deleteJson<T>(url: string) {
  const response = await api.delete<ApiResponse<T>>(url);
  return response.data;
}
