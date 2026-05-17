package yjh.ontongsal.cakeorderplatform.service_api.post.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.CommentEntity
import java.time.LocalDateTime

data class CommentResponse(
    val id: Long,
    val postId: Long,
    val authorName: String,
    val authorProfileImageUrl: String?,
    val content: String,
    val createdAt: LocalDateTime,
) {
    companion object {
        fun from(
            entity: CommentEntity,
            authorName: String,
            authorProfileImageUrl: String?,
        ) = CommentResponse(
            id = entity.id,
            postId = entity.postId,
            authorName = authorName,
            authorProfileImageUrl = authorProfileImageUrl,
            content = entity.content,
            createdAt = entity.createdAt,
        )
    }
}
