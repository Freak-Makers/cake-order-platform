import axios, {AxiosError, AxiosResponse} from "axios";
import {ErrorResponse, SuccessResponse} from "@/api/types";

const serverApi = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
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