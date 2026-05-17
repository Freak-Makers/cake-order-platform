package yjh.ontongsal.cakeorderplatform.admin_api.post.presentation

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import yjh.ontongsal.cakeorderplatform.admin_api.post.application.AdminPostService

@RestController
@RequestMapping("/api/v1/admin/posts")
class AdminPostController(
    private val adminPostService: AdminPostService,
) {
    @GetMapping
    fun getPosts(
        @RequestParam(defaultValue = "0") offset: Int,
        @RequestParam(defaultValue = "20") limit: Int,
    ): ResponseEntity<AdminPostsResponse> {
        return ResponseEntity.ok(adminPostService.getPosts(offset, limit))
    }

    @PostMapping
    fun createPost(@RequestBody request: AdminPostCreateRequest): ResponseEntity<AdminPostResponse> {
        return ResponseEntity.ok(adminPostService.createPost(request))
    }

    @PutMapping("/{id}")
    fun updatePost(
        @PathVariable id: Long,
        @RequestBody request: AdminPostUpdateRequest,
    ): ResponseEntity<AdminPostResponse> {
        return ResponseEntity.ok(adminPostService.updatePost(id, request))
    }

    @DeleteMapping("/{id}")
    fun deletePost(@PathVariable id: Long): ResponseEntity<Unit> {
        adminPostService.deletePost(id)
        return ResponseEntity.ok().build()
    }
}
