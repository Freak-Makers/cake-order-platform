package yjh.ontongsal.cakeorderplatform.service_api.chat.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ChatRoomEntity
import java.time.LocalDateTime

data class ChatRoomResponse(
    val id: Long,
    val customerId: Long,
    val adminId: Long,
    val lastMessageAt: LocalDateTime?,
    val lastMessagePreview: String?,
    val unreadCount: Int,
    val createdAt: LocalDateTime,
) {
    companion object {
        fun from(entity: ChatRoomEntity) = ChatRoomResponse(
            id = entity.id,
            customerId = entity.customerId,
            adminId = entity.adminId,
            lastMessageAt = entity.lastMessageAt,
            lastMessagePreview = entity.lastMessagePreview,
            unreadCount = entity.customerUnreadCount,
            createdAt = entity.createdAt,
        )
    }
}
