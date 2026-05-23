package yjh.ontongsal.cakeorderplatform.core.chat.application

import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component
import yjh.ontongsal.cakeorderplatform.core.chat.presentation.ChatPushMessage

/**
 * STOMP user destination push 전담. 트랜잭션 밖에서 호출되어야 한다.
 */
@Component
class ChatMessagePublisher(
    private val messagingTemplate: SimpMessagingTemplate,
) {
    fun push(toUserId: Long, payload: ChatPushMessage) {
        messagingTemplate.convertAndSendToUser(toUserId.toString(), "/queue/messages", payload)
    }
}
