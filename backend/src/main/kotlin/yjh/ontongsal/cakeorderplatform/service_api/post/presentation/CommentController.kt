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
        @AuthenticationPrincipal userDetails: TestingUserDetails?,
        @RequestParam(defaultValue = "0") offset: Int,
        @RequestParam(defaultValue = "5") limit: Int,
    ): ResponseEntity<CommentsResponse> {
        return ResponseEntity.ok(commentService.getComments(postId, offset, limit, userDetails?.userId))
    }

    @PostMapping
    fun createComment(
        @PathVariable postId: Long,
        @AuthenticationPrincipal userDetails: TestingUserDetails,
        @RequestBody request: CommentCreateRequest,
    ): ResponseEntity<CommentResponse> {
        return ResponseEntity.ok(commentService.createComment(postId, userDetails.userId, request))
    }

    @PutMapping("/{commentId}")
    fun updateComment(
        @PathVariable postId: Long,
        @PathVariable commentId: Long,
        @AuthenticationPrincipal userDetails: TestingUserDetails,
        @RequestBody request: CommentUpdateRequest,
    ): ResponseEntity<CommentResponse> {
        // postId 는 URL 식별용. 서비스 레이어에서 commentId 기준으로 작성자만 검증.
        return ResponseEntity.ok(commentService.updateComment(commentId, userDetails.userId, request))
    }

    @DeleteMapping("/{commentId}")
    fun deleteComment(
        @PathVariable postId: Long,
        @PathVariable commentId: Long,
        @AuthenticationPrincipal userDetails: TestingUserDetails,
    ): ResponseEntity<Unit> {
        commentService.deleteComment(commentId, userDetails.userId)
        return ResponseEntity.ok().build()
    }
}
