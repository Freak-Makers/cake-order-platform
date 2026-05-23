package yjh.ontongsal.cakeorderplatform.admin_api.notification.presentation

data class AdminNotificationsResponse(
    val items: List<AdminNotificationResponse>,
    val total: Long,
    val offset: Int,
    val limit: Int,
    val unreadCount: Long,
)
