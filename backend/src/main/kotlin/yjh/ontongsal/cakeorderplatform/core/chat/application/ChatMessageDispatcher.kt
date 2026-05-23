package yjh.ontongsal.cakeorderplatform.core.chat.application

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.core.exception.AppException
import yjh.ontongsal.cakeorderplatform.core.exception.ErrorCode
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ChatMessageEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.SenderType
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ChatMessageRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ChatRoomRepository
import java.time.LocalDateTime

private const val MAX_CONTENT_LENGTH = 2000
private const val PREVIEW_MAX_LENGTH = 200

/**
 * STOMP 핸들러에서 호출되는 핵심 로직.
 *
 * - persist(): 트랜잭션 안에서 메시지 저장 + 채팅방 갱신.
 * - 상대방 push 는 호출자가 트랜잭션 종료 후 별도로 수행한다 (`ChatMessagePublisher`).
 */
@Service
class ChatMessageDispatcher(
    private val chatRoomRepository: ChatRoomRepository,
    private val chatMessageRepository: ChatMessageRepository,
) {

    @Transactional
    fun persist(
        senderId: Long,
        senderType: SenderType,
        roomId: Long,
        rawContent: String,
    ): PersistResult {
        val content = rawContent.trim()
        if (content.isEmpty()) {
            throw AppException.BadRequest(ErrorCode.CHAT_MESSAGE_EMPTY)
        }
        if (content.length > MAX_CONTENT_LENGTH) {
            throw AppException.BadRequest(ErrorCode.CHAT_MESSAGE_TOO_LONG)
        }

        val room = chatRoomRepository.findById(roomId)
            .orElseThrow { AppException.NotFound(ErrorCode.CHAT_ROOM_NOT_FOUND) }

        // 발신자가 채팅방의 실제 참가자인지 검증
        val recipientUserId = when (senderType) {
            SenderType.CUSTOMER -> {
                if (room.customerId != senderId) {
                    throw AppException.Forbidden(ErrorCode.CHAT_ROOM_FORBIDDEN)
                }
                room.adminId
            }
            SenderType.ADMIN -> {
                if (room.adminId != senderId) {
                    throw AppException.Forbidden(ErrorCode.CHAT_ROOM_FORBIDDEN)
                }
                room.customerId
            }
        }

        val saved = chatMessageRepository.save(
            ChatMessageEntity(
                chatRoomId = room.id,
                senderId = senderId,
                senderType = senderType,
                content = content,
            )
        )

        room.lastMessageAt = LocalDateTime.now()
        room.lastMessagePreview = content.take(PREVIEW_MAX_LENGTH)
        when (senderType) {
            SenderType.CUSTOMER -> room.adminUnreadCount += 1
            SenderType.ADMIN -> room.customerUnreadCount += 1
        }

        return PersistResult(message = saved, recipientUserId = recipientUserId)
    }
}

data class PersistResult(
    val message: ChatMessageEntity,
    val recipientUserId: Long,
)
