import fetchApi from "~/api/fetch";

// fetchApi 위의 { get, post, put, delete } 래퍼. 도메인별 호출은 이걸로.
const apiClient = {
  get: <T>(url: string) => fetchApi<T>(url),

  post: <T, B = unknown>(url: string, body?: B) =>
    fetchApi<T>(url, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T, B = unknown>(url: string, body?: B) =>
    fetchApi<T>(url, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: <T>(url: string) =>
    fetchApi<T>(url, {
      method: "DELETE",
    }),
};

export default apiClient;
