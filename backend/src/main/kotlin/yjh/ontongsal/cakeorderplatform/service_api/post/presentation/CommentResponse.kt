package yjh.ontongsal.cakeorderplatform.service_api.post.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.CommentEntity
import java.time.LocalDateTime

data class CommentResponse(
    val id: Long,
    val postId: Long,
    val authorName: String,
    val authorProfileImageUrl: String?,
    val content: String,
    // 현재 호출자가 작성자인지. 프론트에서 수정/삭제 버튼 노출 판단용. 비로그인 / 익명 조회 시 false.
    val isMine: Boolean,
    val createdAt: LocalDateTime,
) {
    companion object {
        fun from(
            entity: CommentEntity,
            authorName: String,
            authorProfileImageUrl: String?,
            isMine: Boolean = false,
        ) = CommentResponse(
            id = entity.id,
            postId = entity.postId,
            authorName = authorName,
            authorProfileImageUrl = authorProfileImageUrl,
            content = entity.content,
            isMine = isMine,
            createdAt = entity.createdAt,
        )
    }
}
