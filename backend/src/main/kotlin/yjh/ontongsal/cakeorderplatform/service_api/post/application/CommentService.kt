package yjh.ontongsal.cakeorderplatform.service_api.post.application

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.core.exception.AppException
import yjh.ontongsal.cakeorderplatform.core.exception.ErrorCode
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.CommentEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.CommentRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.PostRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.UserRepository
import yjh.ontongsal.cakeorderplatform.service_api.post.presentation.CommentCreateRequest
import yjh.ontongsal.cakeorderplatform.service_api.post.presentation.CommentResponse
import yjh.ontongsal.cakeorderplatform.service_api.post.presentation.CommentUpdateRequest
import yjh.ontongsal.cakeorderplatform.service_api.post.presentation.CommentsResponse

private val log = KotlinLogging.logger {}

@Service
class CommentService(
    private val commentRepository: CommentRepository,
    private val postRepository: PostRepository,
    private val userRepository: UserRepository,
) {
    @Transactional(readOnly = true)
    fun getComments(postId: Long, offset: Int, limit: Int, currentUserId: Long?): CommentsResponse {
        if (!postRepository.existsById(postId)) {
            throw AppException.NotFound(ErrorCode.ARTICLE_NOT_FOUND)
        }
        val safeLimit = limit.coerceIn(1, 100)
        val safeOffset = offset.coerceAtLeast(0)
        val pageIdx = safeOffset / safeLimit

        val page = commentRepository.findAllByPostId(
            postId,
            // createdAt 만으로는 시드처럼 같은 ms 에 저장된 row 가 페이지 사이 중복될 수 있어
            // id 를 보조 정렬로 추가 (stable paging).
            PageRequest.of(
                pageIdx,
                safeLimit,
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")),
            ),
        )
        log.info {
            "[comments] postId=$postId offset=$safeOffset limit=$safeLimit pageIdx=$pageIdx total=${page.totalElements} ids=${page.content.map { it.id }}"
        }
        val items = page.content.map { comment ->
            val author = userRepository.findById(comment.userId).orElse(null)
            CommentResponse.from(
                entity = comment,
                authorName = author?.nickname ?: "Unknown",
                authorProfileImageUrl = author?.profileImageUrl,
                isMine = currentUserId != null && comment.userId == currentUserId,
            )
        }
        return CommentsResponse(
            items = items,
            total = page.totalElements,
            offset = pageIdx * safeLimit,
            limit = safeLimit,
        )
    }

    @Transactional
    fun createComment(postId: Long, userId: Long, request: CommentCreateRequest): CommentResponse {
        if (!postRepository.existsById(postId)) {
            throw AppException.NotFound(ErrorCode.ARTICLE_NOT_FOUND)
        }
        val saved = commentRepository.save(
            CommentEntity(postId = postId, userId = userId, content = request.content)
        )
        val author = userRepository.findById(userId).orElse(null)
        return CommentResponse.from(
            entity = saved,
            authorName = author?.nickname ?: "Unknown",
            authorProfileImageUrl = author?.profileImageUrl,
            isMine = true,
        )
    }

    @Transactional
    fun updateComment(commentId: Long, userId: Long, request: CommentUpdateRequest): CommentResponse {
        val comment = commentRepository.findById(commentId)
            .orElseThrow { AppException.NotFound(ErrorCode.COMMENT_NOT_FOUND) }
        if (comment.userId != userId) {
            throw AppException.Forbidden(ErrorCode.COMMENT_MODIFY_FORBIDDEN)
        }
        comment.content = request.content
        val author = userRepository.findById(userId).orElse(null)
        return CommentResponse.from(
            entity = comment,
            authorName = author?.nickname ?: "Unknown",
            authorProfileImageUrl = author?.profileImageUrl,
            isMine = true,
        )
    }

    @Transactional
    fun deleteComment(commentId: Long, userId: Long) {
        val comment = commentRepository.findById(commentId)
            .orElseThrow { AppException.NotFound(ErrorCode.COMMENT_NOT_FOUND) }
        if (comment.userId != userId) {
            throw AppException.Forbidden(ErrorCode.COMMENT_DELETE_FORBIDDEN)
        }
        // CommentEntity 가 @SQLDelete 적용돼 있어 deleteById 가 UPDATE 로 변환됨 (소프트 딜리트).
        commentRepository.deleteById(commentId)
    }
}
