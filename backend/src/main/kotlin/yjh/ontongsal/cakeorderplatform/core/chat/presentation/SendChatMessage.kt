package yjh.ontongsal.cakeorderplatform.core.chat.presentation

/**
 * STOMP `/app/chat.send` inbound 페이로드.
 */
data class SendChatMessage(
    val roomId: Long,
    val content: String,
)
