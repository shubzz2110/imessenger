import axios, { type AxiosInstance } from "axios";
import useAuthstore from "../store/auth";

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:4000/api",
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthstore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // useAuthstore.getState().clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = `/auth/signin?reason=expired`;
      }
    }
    return Promise.reject(error);
  },
);

export default api;
