package yjh.ontongsal.cakeorderplatform.admin_api.post.application

import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.admin_api.post.presentation.AdminPostCreateRequest
import yjh.ontongsal.cakeorderplatform.admin_api.post.presentation.AdminPostResponse
import yjh.ontongsal.cakeorderplatform.admin_api.post.presentation.AdminPostUpdateRequest
import yjh.ontongsal.cakeorderplatform.admin_api.post.presentation.AdminPostsResponse
import yjh.ontongsal.cakeorderplatform.core.exception.AppException
import yjh.ontongsal.cakeorderplatform.core.exception.ErrorCode
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.PostEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.CommentRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.PostLikeRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.PostRepository

private val POST_SORT = Sort.by(
    Sort.Order.desc("isNotice"),
    Sort.Order.desc("createdAt"),
)

@Service
class AdminPostService(
    private val postRepository: PostRepository,
    private val commentRepository: CommentRepository,
    private val postLikeRepository: PostLikeRepository,
) {
    @Transactional(readOnly = true)
    fun getPosts(offset: Int, limit: Int): AdminPostsResponse {
        val safeLimit = limit.coerceIn(1, 100)
        val safeOffset = offset.coerceAtLeast(0)
        val pageIdx = safeOffset / safeLimit
        val page = postRepository.findAll(PageRequest.of(pageIdx, safeLimit, POST_SORT))
        return AdminPostsResponse(
            items = page.content.map { AdminPostResponse.from(it) },
            total = page.totalElements,
            offset = pageIdx * safeLimit,
            limit = safeLimit,
        )
    }

    @Transactional
    fun createPost(request: AdminPostCreateRequest): AdminPostResponse {
        val post = PostEntity(
            productId = request.productId,
            title = request.title,
            content = request.content,
            imageUrl = request.imageUrl,
            isNotice = request.isNotice,
        )
        return AdminPostResponse.from(postRepository.save(post))
    }

    @Transactional
    fun updatePost(id: Long, request: AdminPostUpdateRequest): AdminPostResponse {
        val post = postRepository.findById(id)
            .orElseThrow { AppException.NotFound(ErrorCode.ARTICLE_NOT_FOUND) }

        request.title?.let { post.title = it }
        request.content?.let { post.content = it }
        request.productId?.let { post.productId = it }
        request.imageUrl?.let { post.imageUrl = it }
        request.isNotice?.let { post.isNotice = it }

        return AdminPostResponse.from(post)
    }

    @Transactional
    fun deletePost(id: Long) {
        if (!postRepository.existsById(id)) {
            throw AppException.NotFound(ErrorCode.ARTICLE_NOT_FOUND)
        }
        commentRepository.deleteAllByPostId(id)
        postLikeRepository.deleteAllByPostId(id)
        postRepository.deleteById(id)
    }
}
