package yjh.ontongsal.cakeorderplatform.core.notification.application

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener
import yjh.ontongsal.cakeorderplatform.core.notification.presentation.NotificationPushMessage
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.NotificationEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.NotificationRepository

private val log = KotlinLogging.logger {}

/**
 * 트리거 트랜잭션(예약 생성/결제 등)이 성공적으로 커밋된 후에만 알림을 저장하고 STOMP push 한다.
 *
 * 알림 영속화는 별도 트랜잭션(REQUIRES_NEW) 으로 수행 — listener 가 호출되는 시점에는
 * 원본 트랜잭션이 이미 커밋된 상태이므로 새 트랜잭션이 필요하다.
 */
@Component
class NotificationListener(
    private val notificationRepository: NotificationRepository,
    private val publisher: NotificationPublisher,
) {

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun on(event: NotifyEvent) {
        val saved = try {
            notificationRepository.save(
                NotificationEntity(
                    recipientUserId = event.recipientUserId,
                    type = event.type,
                    title = event.title,
                    body = event.body,
                    linkUrl = event.linkUrl,
                )
            )
        } catch (e: Exception) {
            // 알림 저장 실패가 원본 트랜잭션(이미 커밋됨)에 영향을 주지 않도록 흡수.
            log.warn(e) { "알림 저장 실패: type=${event.type} to=${event.recipientUserId}" }
            return
        }

        try {
            publisher.push(event.recipientUserId, NotificationPushMessage.from(saved))
        } catch (e: Exception) {
            log.warn(e) { "알림 push 실패 (저장은 됨): id=${saved.id}" }
        }
    }
}
