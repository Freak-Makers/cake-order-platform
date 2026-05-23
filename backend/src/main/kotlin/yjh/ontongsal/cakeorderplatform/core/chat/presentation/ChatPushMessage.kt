package yjh.ontongsal.cakeorderplatform.core.chat.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ChatMessageEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.SenderType
import java.time.LocalDateTime

/**
 * 상대방에게 `/user/{userId}/queue/messages` 로 푸시되는 페이로드.
 */
data class ChatPushMessage(
    val roomId: Long,
    val messageId: Long,
    val senderId: Long,
    val senderType: SenderType,
    val content: String,
    val sentAt: LocalDateTime,
) {
    companion object {
        fun from(entity: ChatMessageEntity) = ChatPushMessage(
            roomId = entity.chatRoomId,
            messageId = entity.id,
            senderId = entity.senderId,
            senderType = entity.senderType,
            content = entity.content,
            sentAt = entity.createdAt,
        )
    }
}
