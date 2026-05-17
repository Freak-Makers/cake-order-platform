package yjh.ontongsal.cakeorderplatform.service_api.product.application

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReviewEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReviewLikeEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ProductRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ReviewLikeRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ReviewRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.UserRepository
import yjh.ontongsal.cakeorderplatform.service_api.product.presentation.ReviewCreateRequest
import yjh.ontongsal.cakeorderplatform.service_api.product.presentation.ReviewResponse

@Service
class ReviewService(
    private val reviewRepository: ReviewRepository,
    private val reviewLikeRepository: ReviewLikeRepository,
    private val userRepository: UserRepository,
    private val productRepository: ProductRepository,
) {
    @Transactional(readOnly = true)
    fun getReviews(productId: Long, currentUserId: Long?): List<ReviewResponse> {
        val reviews = reviewRepository.findAllByProductIdOrderByCreatedAtDesc(productId)
        return reviews.map { review ->
            val author = userRepository.findById(review.userId).orElse(null)
            val isLiked = currentUserId?.let { reviewLikeRepository.existsByUserIdAndReviewId(it, review.id) } ?: false
            
            ReviewResponse.from(
                entity = review,
                authorName = author?.nickname ?: "Unknown",
                authorProfileImageUrl = author?.profileImageUrl,
                isLiked = isLiked
            )
        }
    }

    @Transactional
    fun createReview(productId: Long, userId: Long, request: ReviewCreateRequest): ReviewResponse {
        if (!productRepository.existsById(productId)) {
            throw IllegalArgumentException("Product not found")
        }

        val review = ReviewEntity(
            productId = productId,
            userId = userId,
            content = request.content,
            rating = request.rating
        )
        val savedReview = reviewRepository.save(review)
        
        val author = userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }
        
        return ReviewResponse.from(
            entity = savedReview,
            authorName = author.nickname,
            authorProfileImageUrl = author.profileImageUrl,
            isLiked = false
        )
    }

    @Transactional
    fun toggleLike(reviewId: Long, userId: Long) {
        val review = reviewRepository.findById(reviewId)
            .orElseThrow { IllegalArgumentException("Review not found") }
            
        val existingLike = reviewLikeRepository.findByUserIdAndReviewId(userId, reviewId)
        
        if (existingLike.isPresent) {
            reviewLikeRepository.delete(existingLike.get())
            review.likeCount = (review.likeCount - 1).coerceAtLeast(0)
        } else {
            reviewLikeRepository.save(ReviewLikeEntity(userId = userId, reviewId = reviewId))
            review.likeCount += 1
        }
    }
}
