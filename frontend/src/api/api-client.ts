import fetchApi from "@/api/fetch.server";

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