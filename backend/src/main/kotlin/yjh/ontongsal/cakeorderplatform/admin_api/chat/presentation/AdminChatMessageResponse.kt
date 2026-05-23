package yjh.ontongsal.cakeorderplatform.admin_api.chat.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ChatMessageEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.SenderType
import java.time.LocalDateTime

data class AdminChatMessageResponse(
    val id: Long,
    val roomId: Long,
    val senderId: Long,
    val senderType: SenderType,
    val content: String,
    val sentAt: LocalDateTime,
) {
    companion object {
        fun from(entity: ChatMessageEntity) = AdminChatMessageResponse(
            id = entity.id,
            roomId = entity.chatRoomId,
            senderId = entity.senderId,
            senderType = entity.senderType,
            content = entity.content,
            sentAt = entity.createdAt,
        )
    }
}
