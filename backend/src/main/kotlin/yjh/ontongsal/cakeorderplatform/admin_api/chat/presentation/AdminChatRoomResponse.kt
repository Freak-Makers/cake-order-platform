package yjh.ontongsal.cakeorderplatform.admin_api.chat.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ChatRoomEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.UserEntity
import java.time.LocalDateTime

data class AdminChatRoomResponse(
    val id: Long,
    val customerId: Long,
    val customerNickname: String,
    val customerProfileImageUrl: String?,
    val adminId: Long,
    val lastMessageAt: LocalDateTime?,
    val lastMessagePreview: String?,
    val unreadCount: Int,
    val createdAt: LocalDateTime,
) {
    companion object {
        fun from(entity: ChatRoomEntity, customer: UserEntity) = AdminChatRoomResponse(
            id = entity.id,
            customerId = entity.customerId,
            customerNickname = customer.nickname,
            customerProfileImageUrl = customer.profileImageUrl,
            adminId = entity.adminId,
            lastMessageAt = entity.lastMessageAt,
            lastMessagePreview = entity.lastMessagePreview,
            unreadCount = entity.adminUnreadCount,
            createdAt = entity.createdAt,
        )
    }
}
