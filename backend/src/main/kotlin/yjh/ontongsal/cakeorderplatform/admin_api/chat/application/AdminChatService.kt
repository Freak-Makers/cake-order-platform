package yjh.ontongsal.cakeorderplatform.admin_api.chat.application

import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.admin_api.chat.presentation.AdminChatMessageResponse
import yjh.ontongsal.cakeorderplatform.admin_api.chat.presentation.AdminChatMessagesResponse
import yjh.ontongsal.cakeorderplatform.admin_api.chat.presentation.AdminChatRoomResponse
import yjh.ontongsal.cakeorderplatform.admin_api.chat.presentation.AdminChatRoomsResponse
import yjh.ontongsal.cakeorderplatform.core.exception.AppException
import yjh.ontongsal.cakeorderplatform.core.exception.ErrorCode
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.UserEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ChatMessageRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ChatRoomRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.UserRepository

@Service
class AdminChatService(
    private val chatRoomRepository: ChatRoomRepository,
    private val chatMessageRepository: ChatMessageRepository,
    private val userRepository: UserRepository,
) {

    @Transactional(readOnly = true)
    fun getRooms(adminId: Long, offset: Int, limit: Int): AdminChatRoomsResponse {
        val safeLimit = limit.coerceIn(1, 100)
        val safeOffset = offset.coerceAtLeast(0).let { it / safeLimit * safeLimit }
        val pageIdx = safeOffset / safeLimit

        val page = chatRoomRepository.findAllForAdmin(adminId, PageRequest.of(pageIdx, safeLimit))
        val customerIds = page.content.map { it.customerId }.distinct()
        val customers: Map<Long, UserEntity> = userRepository.findAllById(customerIds)
            .associateBy { it.id }

        val items = page.content.map { room ->
            val customer = customers[room.customerId]
                ?: throw AppException.NotFound(ErrorCode.USER_NOT_FOUND)
            AdminChatRoomResponse.from(room, customer)
        }
        return AdminChatRoomsResponse(
            items = items,
            total = page.totalElements,
            offset = safeOffset,
            limit = safeLimit,
        )
    }

    @Transactional(readOnly = true)
    fun getMessages(
        adminId: Long,
        roomId: Long,
        offset: Int,
        limit: Int,
    ): AdminChatMessagesResponse {
        val safeLimit = limit.coerceIn(1, 100)
        val safeOffset = offset.coerceAtLeast(0).let { it / safeLimit * safeLimit }
        val pageIdx = safeOffset / safeLimit

        val room = chatRoomRepository.findById(roomId)
            .orElseThrow { AppException.NotFound(ErrorCode.CHAT_ROOM_NOT_FOUND) }
        if (room.adminId != adminId) {
            throw AppException.Forbidden(ErrorCode.CHAT_ROOM_FORBIDDEN)
        }

        val page = chatMessageRepository.findAllByChatRoomId(roomId, PageRequest.of(pageIdx, safeLimit))
        return AdminChatMessagesResponse(
            items = page.content.map(AdminChatMessageResponse.Companion::from),
            total = page.totalElements,
            offset = safeOffset,
            limit = safeLimit,
        )
    }

    @Transactional
    fun markAsRead(adminId: Long, roomId: Long) {
        val room = chatRoomRepository.findById(roomId)
            .orElseThrow { AppException.NotFound(ErrorCode.CHAT_ROOM_NOT_FOUND) }
        if (room.adminId != adminId) {
            throw AppException.Forbidden(ErrorCode.CHAT_ROOM_FORBIDDEN)
        }
        room.adminUnreadCount = 0
    }
}
