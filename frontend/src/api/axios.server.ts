import axios, {AxiosError, AxiosResponse} from "axios";
import {ErrorResponse, SuccessResponse} from "@/api/types";

const serverApi = axios.create({
  // NEXT_PUBLIC_ 접두사가 있어야 클라이언트 번들에 인라인됨. Vercel 등 호스팅에선 env 로 주입.
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  withCredentials: true,
});

serverApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && !config.headers?.Authorization) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

serverApi.interceptors.response.use(
  (response: AxiosResponse) => {
    // ✅ AxiosResponse -> SuccessResponse 로 변환
    return response.data;
  },

  (error: AxiosError<ErrorResponse>) => {
    if (!error.response) {
      console.error("[NETWORK ERROR]", error.message);
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    console.error("[HTTP ERROR]");
    console.error("status:", status);

    if (data) {
      console.error("message:", data.message);
      console.error("details:", data.details);
      console.error("timestamp:", data.timestamp);
    }

    return Promise.reject(error);
  }
);

export default serverApi;