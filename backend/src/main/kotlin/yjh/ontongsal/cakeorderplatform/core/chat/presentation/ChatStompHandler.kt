package yjh.ontongsal.cakeorderplatform.core.chat.presentation

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.stereotype.Controller
import yjh.ontongsal.cakeorderplatform.core.chat.application.ChatMessageDispatcher
import yjh.ontongsal.cakeorderplatform.core.chat.application.ChatMessagePublisher
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.SenderType
import yjh.ontongsal.cakeorderplatform.core.security.stomp.StompPrincipal
import java.security.Principal

private val log = KotlinLogging.logger {}

@Controller
class ChatStompHandler(
    private val dispatcher: ChatMessageDispatcher,
    private val publisher: ChatMessagePublisher,
) {

    @MessageMapping("/chat.send")
    fun send(@Payload payload: SendChatMessage, principal: Principal) {
        val stompPrincipal = principal as? StompPrincipal
            ?: throw IllegalStateException("STOMP principal 이 StompPrincipal 이 아닙니다")

        val senderType = if (stompPrincipal.role == "ADMIN") SenderType.ADMIN else SenderType.CUSTOMER

        val result = dispatcher.persist(
            senderId = stompPrincipal.userIdValue,
            senderType = senderType,
            roomId = payload.roomId,
            rawContent = payload.content,
        )

        // 트랜잭션 종료 후 push (Dispatcher.persist 의 @Transactional 가 이미 끝난 상태)
        publisher.push(result.recipientUserId, ChatPushMessage.from(result.message))
        log.debug { "chat msg ${result.message.id} sent from=${stompPrincipal.userIdValue} to=${result.recipientUserId} room=${payload.roomId}" }
    }
}
