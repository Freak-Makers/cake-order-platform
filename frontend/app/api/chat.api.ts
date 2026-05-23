import apiClient from "~/api/api-client";
import type {
  AdminChatRoomsResponse,
  ChatMessagesResponse,
  ChatRoom,
} from "~/api/types";

// 고객 ----------------------------------------------------------------

// 본인 채팅방 조회 (없으면 자동 생성)
export const getMyRoom = () => apiClient.get<ChatRoom>("/api/v1/chat/room");

// 본인 방 메시지 히스토리 (최신 desc)
export const getMyMessages = (roomId: number, offset = 0, limit = 50) =>
  apiClient.get<ChatMessagesResponse>(
    `/api/v1/chat/rooms/${roomId}/messages?offset=${offset}&limit=${limit}`,
  );

// 본인 unread 카운트 0 으로 리셋
export const markMyRoomRead = (roomId: number) =>
  apiClient.post<void>(`/api/v1/chat/rooms/${roomId}/read`);

// 관리자 --------------------------------------------------------------

// 관리자 채팅방 목록 (안 읽음 우선, 최신 메시지순)
export const getAdminRooms = (offset = 0, limit = 20) =>
  apiClient.get<AdminChatRoomsResponse>(
    `/api/v1/admin/chat/rooms?offset=${offset}&limit=${limit}`,
  );

// 관리자가 특정 방 메시지 조회
export const getAdminMessages = (roomId: number, offset = 0, limit = 50) =>
  apiClient.get<ChatMessagesResponse>(
    `/api/v1/admin/chat/rooms/${roomId}/messages?offset=${offset}&limit=${limit}`,
  );

// 관리자 unread 카운트 리셋
export const markAdminRoomRead = (roomId: number) =>
  apiClient.post<void>(`/api/v1/admin/chat/rooms/${roomId}/read`);
