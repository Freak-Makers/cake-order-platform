package yjh.ontongsal.cakeorderplatform.core.notification.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.NotificationEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.NotificationType
import java.time.LocalDateTime

/**
 * STOMP `/user/{userId}/queue/notifications` 로 푸시되는 페이로드.
 */
data class NotificationPushMessage(
    val id: Long,
    val type: NotificationType,
    val title: String,
    val body: String,
    val linkUrl: String?,
    val createdAt: LocalDateTime,
) {
    companion object {
        fun from(entity: NotificationEntity) = NotificationPushMessage(
            id = entity.id,
            type = entity.type,
            title = entity.title,
            body = entity.body,
            linkUrl = entity.linkUrl,
            createdAt = entity.createdAt,
        )
    }
}
