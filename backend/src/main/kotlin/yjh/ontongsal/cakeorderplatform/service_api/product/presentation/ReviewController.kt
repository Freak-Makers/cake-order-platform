package yjh.ontongsal.cakeorderplatform.service_api.product.presentation

import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import yjh.ontongsal.cakeorderplatform.core.security.TestingUserDetails
import yjh.ontongsal.cakeorderplatform.service_api.product.application.ReviewService

@RestController
@RequestMapping("/api/v1")
class ReviewController(
    private val reviewService: ReviewService,
) {
    @GetMapping("/products/{productId}/reviews")
    fun getReviews(
        @PathVariable productId: Long,
        @AuthenticationPrincipal userDetails: TestingUserDetails?,
    ): ResponseEntity<List<ReviewResponse>> {
        return ResponseEntity.ok(reviewService.getReviews(productId, userDetails?.userId))
    }

    @PostMapping("/products/{productId}/reviews")
    fun createReview(
        @PathVariable productId: Long,
        @AuthenticationPrincipal userDetails: TestingUserDetails,
        @RequestBody request: ReviewCreateRequest,
    ): ResponseEntity<ReviewResponse> {
        return ResponseEntity.ok(reviewService.createReview(productId, userDetails.userId, request))
    }

    @PostMapping("/reviews/{id}/like")
    fun toggleLike(
        @PathVariable id: Long,
        @AuthenticationPrincipal userDetails: TestingUserDetails,
    ): ResponseEntity<Unit> {
        reviewService.toggleLike(id, userDetails.userId)
        return ResponseEntity.ok().build()
    }
}
