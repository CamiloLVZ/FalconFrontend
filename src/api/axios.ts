import axios from "axios";

import { AUTH_TOKEN_KEY } from "../auth/constants/auth.constants";

let isRedirecting = false;

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status = error.response?.status;

    const requestUrl = error.config?.url ?? "";

    const isLoginRequest = requestUrl.includes("/auth/login");

    if (status === 401 && !isLoginRequest && !isRedirecting) {
      isRedirecting = true;

      localStorage.removeItem(AUTH_TOKEN_KEY);

      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);
