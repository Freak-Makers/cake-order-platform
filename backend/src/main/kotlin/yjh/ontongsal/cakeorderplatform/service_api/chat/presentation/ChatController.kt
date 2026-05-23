package yjh.ontongsal.cakeorderplatform.service_api.chat.presentation

import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import yjh.ontongsal.cakeorderplatform.core.security.TestingUserDetails
import yjh.ontongsal.cakeorderplatform.service_api.chat.application.ChatService

@RestController
@RequestMapping("/api/v1/chat")
class ChatController(
    private val chatService: ChatService,
) {

    @GetMapping("/room")
    fun getMyRoom(
        @AuthenticationPrincipal userDetails: TestingUserDetails,
    ): ResponseEntity<ChatRoomResponse> {
        return ResponseEntity.ok(chatService.getOrCreateMyRoom(userDetails.userId))
    }

    @GetMapping("/rooms/{id}/messages")
    fun getMessages(
        @PathVariable id: Long,
        @AuthenticationPrincipal userDetails: TestingUserDetails,
        @RequestParam(defaultValue = "0") offset: Int,
        @RequestParam(defaultValue = "20") limit: Int,
    ): ResponseEntity<ChatMessagesResponse> {
        return ResponseEntity.ok(chatService.getMessages(userDetails.userId, id, offset, limit))
    }

    @PostMapping("/rooms/{id}/read")
    fun markAsRead(
        @PathVariable id: Long,
        @AuthenticationPrincipal userDetails: TestingUserDetails,
    ): ResponseEntity<Unit> {
        chatService.markAsRead(userDetails.userId, id)
        return ResponseEntity.ok().build()
    }
}
