package yjh.ontongsal.cakeorderplatform.service_api.post.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.PostEntity
import java.time.LocalDateTime

data class PostResponse(
    val id: Long,
    val productId: Long?,
    val title: String,
    val content: String,
    val imageUrl: String?,
    val viewCount: Long,
    val likeCount: Int,
    val isLiked: Boolean,
    val isNotice: Boolean,
    val createdAt: LocalDateTime,
) {
    companion object {
        fun from(entity: PostEntity, isLiked: Boolean) = PostResponse(
            id = entity.id,
            productId = entity.productId,
            title = entity.title,
            content = entity.content,
            imageUrl = entity.imageUrl,
            viewCount = entity.viewCount,
            likeCount = entity.likeCount,
            isLiked = isLiked,
            isNotice = entity.isNotice,
            createdAt = entity.createdAt,
        )
    }
}
