package yjh.ontongsal.cakeorderplatform.admin_api.chat.presentation

import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import yjh.ontongsal.cakeorderplatform.admin_api.chat.application.AdminChatService
import yjh.ontongsal.cakeorderplatform.core.security.TestingUserDetails

@RestController
@RequestMapping("/api/v1/admin/chat")
class AdminChatController(
    private val adminChatService: AdminChatService,
) {

    @GetMapping("/rooms")
    fun getRooms(
        @AuthenticationPrincipal userDetails: TestingUserDetails,
        @RequestParam(defaultValue = "0") offset: Int,
        @RequestParam(defaultValue = "20") limit: Int,
    ): ResponseEntity<AdminChatRoomsResponse> {
        return ResponseEntity.ok(adminChatService.getRooms(userDetails.userId, offset, limit))
    }

    @GetMapping("/rooms/{id}/messages")
    fun getMessages(
        @PathVariable id: Long,
        @AuthenticationPrincipal userDetails: TestingUserDetails,
        @RequestParam(defaultValue = "0") offset: Int,
        @RequestParam(defaultValue = "20") limit: Int,
    ): ResponseEntity<AdminChatMessagesResponse> {
        return ResponseEntity.ok(adminChatService.getMessages(userDetails.userId, id, offset, limit))
    }

    @PostMapping("/rooms/{id}/read")
    fun markAsRead(
        @PathVariable id: Long,
        @AuthenticationPrincipal userDetails: TestingUserDetails,
    ): ResponseEntity<Unit> {
        adminChatService.markAsRead(userDetails.userId, id)
        return ResponseEntity.ok().build()
    }
}
