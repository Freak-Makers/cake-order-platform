package yjh.ontongsal.cakeorderplatform.service_api.post.presentation

import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import yjh.ontongsal.cakeorderplatform.core.security.TestingUserDetails
import yjh.ontongsal.cakeorderplatform.service_api.post.application.CommentService

@RestController
@RequestMapping("/api/v1/posts/{postId}/comments")
class CommentController(
    private val commentService: CommentService,
) {
    @GetMapping
    fun getComments(
        @PathVariable postId: Long,
        @RequestParam(defaultValue = "0") offset: Int,
        @RequestParam(defaultValue = "5") limit: Int,
    ): ResponseEntity<CommentsResponse> {
        return ResponseEntity.ok(commentService.getComments(postId, offset, limit))
    }

    @PostMapping
    fun createComment(
        @PathVariable postId: Long,
        @AuthenticationPrincipal userDetails: TestingUserDetails,
        @RequestBody request: CommentCreateRequest,
    ): ResponseEntity<CommentResponse> {
        return ResponseEntity.ok(commentService.createComment(postId, userDetails.userId, request))
    }
}
