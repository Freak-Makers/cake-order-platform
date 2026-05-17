package yjh.ontongsal.cakeorderplatform.service_api.product.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReviewEntity
import java.time.LocalDateTime

data class ReviewResponse(
    val id: Long,
    val productId: Long,
    val authorName: String,
    val authorProfileImageUrl: String?,
    val content: String,
    val rating: Int,
    val likeCount: Int,
    val isLiked: Boolean,
    val createdAt: LocalDateTime,
) {
    companion object {
        fun from(
            entity: ReviewEntity,
            authorName: String,
            authorProfileImageUrl: String?,
            isLiked: Boolean
        ) = ReviewResponse(
            id = entity.id,
            productId = entity.productId,
            authorName = authorName,
            authorProfileImageUrl = authorProfileImageUrl,
            content = entity.content,
            rating = entity.rating,
            likeCount = entity.likeCount,
            isLiked = isLiked,
            createdAt = entity.createdAt
        )
    }
}
