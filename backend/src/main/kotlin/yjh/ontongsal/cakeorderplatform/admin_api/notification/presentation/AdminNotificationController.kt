package yjh.ontongsal.cakeorderplatform.admin_api.notification.presentation

import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import yjh.ontongsal.cakeorderplatform.admin_api.notification.application.AdminNotificationService
import yjh.ontongsal.cakeorderplatform.core.security.TestingUserDetails

@RestController
@RequestMapping("/api/v1/admin/notifications")
class AdminNotificationController(
    private val adminNotificationService: AdminNotificationService,
) {

    @GetMapping
    fun list(
        @AuthenticationPrincipal userDetails: TestingUserDetails,
        @RequestParam(defaultValue = "0") offset: Int,
        @RequestParam(defaultValue = "10") limit: Int,
    ): ResponseEntity<AdminNotificationsResponse> {
        return ResponseEntity.ok(adminNotificationService.getNotifications(userDetails.userId, offset, limit))
    }

    @GetMapping("/unread-count")
    fun unreadCount(
        @AuthenticationPrincipal userDetails: TestingUserDetails,
    ): ResponseEntity<Map<String, Long>> {
        return ResponseEntity.ok(mapOf("count" to adminNotificationService.getUnreadCount(userDetails.userId)))
    }

    @PostMapping("/{id}/read")
    fun markRead(
        @PathVariable id: Long,
        @AuthenticationPrincipal userDetails: TestingUserDetails,
    ): ResponseEntity<Unit> {
        adminNotificationService.markRead(userDetails.userId, id)
        return ResponseEntity.ok().build()
    }

    @PostMapping("/read-all")
    fun markAllRead(
        @AuthenticationPrincipal userDetails: TestingUserDetails,
    ): ResponseEntity<Unit> {
        adminNotificationService.markAllRead(userDetails.userId)
        return ResponseEntity.ok().build()
    }
}
