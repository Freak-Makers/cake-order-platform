package yjh.ontongsal.cakeorderplatform.core.notification.application

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.NotificationType

/**
 * 알림 발행 이벤트. ReservationService/PaymentService 등 도메인 서비스가
 * `ApplicationEventPublisher.publishEvent(...)` 로 발행하면 NotificationListener 가
 * 트랜잭션 커밋 후 저장 + STOMP push 한다.
 */
data class NotifyEvent(
    val recipientUserId: Long,
    val type: NotificationType,
    val title: String,
    val body: String,
    val linkUrl: String? = null,
)
