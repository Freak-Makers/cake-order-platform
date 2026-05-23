package yjh.ontongsal.cakeorderplatform.core.notification.application

import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component
import yjh.ontongsal.cakeorderplatform.core.notification.presentation.NotificationPushMessage

/**
 * STOMP user destination 으로 알림을 푸시한다.
 * destination: `/user/{userId}/queue/notifications`
 */
@Component
class NotificationPublisher(
    private val messagingTemplate: SimpMessagingTemplate,
) {
    fun push(toUserId: Long, payload: NotificationPushMessage) {
        messagingTemplate.convertAndSendToUser(toUserId.toString(), "/queue/notifications", payload)
    }
}
