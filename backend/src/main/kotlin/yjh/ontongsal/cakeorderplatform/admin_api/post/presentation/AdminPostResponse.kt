package yjh.ontongsal.cakeorderplatform.admin_api.post.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.PostEntity
import java.time.LocalDateTime

data class AdminPostResponse(
    val id: Long,
    val productId: Long?,
    val title: String,
    val content: String,
    val imageUrl: String?,
    val viewCount: Long,
    val likeCount: Int,
    val isNotice: Boolean,
    val createdAt: LocalDateTime,
) {
    companion object {
        fun from(entity: PostEntity) = AdminPostResponse(
            id = entity.id,
            productId = entity.productId,
            title = entity.title,
            content = entity.content,
            imageUrl = entity.imageUrl,
            viewCount = entity.viewCount,
            likeCount = entity.likeCount,
            isNotice = entity.isNotice,
            createdAt = entity.createdAt,
        )
    }
}
