package yjh.ontongsal.cakeorderplatform.admin_api.notification.application

import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.admin_api.notification.presentation.AdminNotificationResponse
import yjh.ontongsal.cakeorderplatform.admin_api.notification.presentation.AdminNotificationsResponse
import yjh.ontongsal.cakeorderplatform.core.exception.AppException
import yjh.ontongsal.cakeorderplatform.core.exception.ErrorCode
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.NotificationRepository
import java.time.LocalDateTime

@Service
class AdminNotificationService(
    private val notificationRepository: NotificationRepository,
) {

    @Transactional(readOnly = true)
    fun getNotifications(adminId: Long, offset: Int, limit: Int): AdminNotificationsResponse {
        val safeLimit = limit.coerceIn(1, 100)
        val safeOffset = offset.coerceAtLeast(0).let { it / safeLimit * safeLimit }
        val pageIdx = safeOffset / safeLimit

        val page = notificationRepository.findAllByRecipientUserId(adminId, PageRequest.of(pageIdx, safeLimit))
        val unread = notificationRepository.countByRecipientUserIdAndReadAtIsNull(adminId)
        return AdminNotificationsResponse(
            items = page.content.map(AdminNotificationResponse.Companion::from),
            total = page.totalElements,
            offset = safeOffset,
            limit = safeLimit,
            unreadCount = unread,
        )
    }

    @Transactional(readOnly = true)
    fun getUnreadCount(adminId: Long): Long {
        return notificationRepository.countByRecipientUserIdAndReadAtIsNull(adminId)
    }

    @Transactional
    fun markRead(adminId: Long, notificationId: Long) {
        val notification = notificationRepository.findByIdAndRecipientUserId(notificationId, adminId)
            ?: throw AppException.NotFound(ErrorCode.NOTIFICATION_NOT_FOUND)
        if (notification.readAt == null) {
            notification.readAt = LocalDateTime.now()
        }
    }

    @Transactional
    fun markAllRead(adminId: Long) {
        notificationRepository.markAllRead(adminId, LocalDateTime.now())
    }
}
