package yjh.ontongsal.cakeorderplatform.admin_api.notification.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.NotificationEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.NotificationType
import java.time.LocalDateTime

data class AdminNotificationResponse(
    val id: Long,
    val type: NotificationType,
    val title: String,
    val body: String,
    val linkUrl: String?,
    val readAt: LocalDateTime?,
    val createdAt: LocalDateTime,
) {
    companion object {
        fun from(entity: NotificationEntity) = AdminNotificationResponse(
            id = entity.id,
            type = entity.type,
            title = entity.title,
            body = entity.body,
            linkUrl = entity.linkUrl,
            readAt = entity.readAt,
            createdAt = entity.createdAt,
        )
    }
}
