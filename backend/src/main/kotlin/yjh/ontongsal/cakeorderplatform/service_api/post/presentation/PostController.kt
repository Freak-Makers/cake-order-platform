package yjh.ontongsal.cakeorderplatform.service_api.post.presentation

import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import yjh.ontongsal.cakeorderplatform.core.security.TestingUserDetails
import yjh.ontongsal.cakeorderplatform.service_api.post.application.PostService

@RestController
@RequestMapping("/api/v1/posts")
class PostController(
    private val postService: PostService,
) {
    @GetMapping
    fun getAllPosts(
        @AuthenticationPrincipal userDetails: TestingUserDetails?,
        @RequestParam(defaultValue = "0") offset: Int,
        @RequestParam(defaultValue = "20") limit: Int,
        @RequestParam(required = false) keyword: String?,
    ): ResponseEntity<PostsResponse> {
        return ResponseEntity.ok(postService.getAllPosts(userDetails?.userId, offset, limit, keyword))
    }

    @GetMapping("/{id}")
    fun getPost(
        @PathVariable id: Long,
        @AuthenticationPrincipal userDetails: TestingUserDetails?,
    ): ResponseEntity<PostResponse> {
        return ResponseEntity.ok(postService.getPost(id, userDetails?.userId))
    }

    @PostMapping("/{id}/like")
    fun toggleLike(
        @PathVariable id: Long,
        @AuthenticationPrincipal userDetails: TestingUserDetails,
    ): ResponseEntity<Unit> {
        postService.toggleLike(id, userDetails.userId)
        return ResponseEntity.ok().build()
    }
}
