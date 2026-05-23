import apiClient from "~/api/api-client";
import type { AdminNotificationsResponse } from "~/api/types";

// 관리자 알림 목록 (최신순). 응답에 unreadCount 가 포함됨.
export const getAdminNotifications = (offset = 0, limit = 10) =>
  apiClient.get<AdminNotificationsResponse>(
    `/api/v1/admin/notifications?offset=${offset}&limit=${limit}`,
  );

// unread 카운트만 빠르게.
export const getUnreadNotificationCount = () =>
  apiClient.get<{ count: number }>("/api/v1/admin/notifications/unread-count");

// 단일 알림 읽음 처리.
export const markNotificationRead = (id: number) =>
  apiClient.post<void>(`/api/v1/admin/notifications/${id}/read`);

// 전체 읽음 처리.
export const markAllNotificationsRead = () =>
  apiClient.post<void>("/api/v1/admin/notifications/read-all");
