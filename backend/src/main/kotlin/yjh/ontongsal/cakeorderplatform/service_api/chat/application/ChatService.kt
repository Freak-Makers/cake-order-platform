package yjh.ontongsal.cakeorderplatform.service_api.chat.application

import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.core.exception.AppException
import yjh.ontongsal.cakeorderplatform.core.exception.ErrorCode
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ChatRoomEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ChatMessageRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ChatRoomRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.UserRepository
import yjh.ontongsal.cakeorderplatform.service_api.chat.presentation.ChatMessageResponse
import yjh.ontongsal.cakeorderplatform.service_api.chat.presentation.ChatMessagesResponse
import yjh.ontongsal.cakeorderplatform.service_api.chat.presentation.ChatRoomResponse

// 단일 관리자 가정 (AdminLoginService 가 항상 userId=1 JWT 발급). 다중 admin 도입 시 별도 전략으로 교체.
private const val DEFAULT_ADMIN_ID: Long = 1L

@Service
class ChatService(
    private val chatRoomRepository: ChatRoomRepository,
    private val chatMessageRepository: ChatMessageRepository,
    private val userRepository: UserRepository,
) {

    @Transactional
    fun getOrCreateMyRoom(customerId: Long): ChatRoomResponse {
        val room = chatRoomRepository.findByCustomerIdAndAdminId(customerId, DEFAULT_ADMIN_ID)
            ?: createRoom(customerId)
        return ChatRoomResponse.from(room)
    }

    private fun createRoom(customerId: Long): ChatRoomEntity {
        if (!userRepository.existsById(DEFAULT_ADMIN_ID)) {
            throw AppException.NotFound(ErrorCode.CHAT_ADMIN_NOT_FOUND)
        }
        return chatRoomRepository.save(
            ChatRoomEntity(customerId = customerId, adminId = DEFAULT_ADMIN_ID)
        )
    }

    @Transactional(readOnly = true)
    fun getMessages(
        customerId: Long,
        roomId: Long,
        offset: Int,
        limit: Int,
    ): ChatMessagesResponse {
        val safeLimit = limit.coerceIn(1, 100)
        val safeOffset = offset.coerceAtLeast(0).let { it / safeLimit * safeLimit }
        val pageIdx = safeOffset / safeLimit

        val room = chatRoomRepository.findById(roomId)
            .orElseThrow { AppException.NotFound(ErrorCode.CHAT_ROOM_NOT_FOUND) }
        if (room.customerId != customerId) {
            throw AppException.Forbidden(ErrorCode.CHAT_ROOM_FORBIDDEN)
        }

        val page = chatMessageRepository.findAllByChatRoomId(roomId, PageRequest.of(pageIdx, safeLimit))
        return ChatMessagesResponse(
            items = page.content.map(ChatMessageResponse.Companion::from),
            total = page.totalElements,
            offset = safeOffset,
            limit = safeLimit,
        )
    }

    @Transactional
    fun markAsRead(customerId: Long, roomId: Long) {
        val room = chatRoomRepository.findById(roomId)
            .orElseThrow { AppException.NotFound(ErrorCode.CHAT_ROOM_NOT_FOUND) }
        if (room.customerId != customerId) {
            throw AppException.Forbidden(ErrorCode.CHAT_ROOM_FORBIDDEN)
        }
        room.customerUnreadCount = 0
    }
}
