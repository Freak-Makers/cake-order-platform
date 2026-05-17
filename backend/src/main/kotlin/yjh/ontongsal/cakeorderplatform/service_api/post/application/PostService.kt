package yjh.ontongsal.cakeorderplatform.service_api.post.application

import jakarta.persistence.criteria.Predicate
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.core.exception.AppException
import yjh.ontongsal.cakeorderplatform.core.exception.ErrorCode
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.PostEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.PostLikeEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.PostLikeRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.PostRepository
import yjh.ontongsal.cakeorderplatform.service_api.post.presentation.PostResponse
import yjh.ontongsal.cakeorderplatform.service_api.post.presentation.PostsResponse

private val POST_SORT = Sort.by(
    Sort.Order.desc("isNotice"),
    Sort.Order.desc("createdAt"),
)

@Service
class PostService(
    private val postRepository: PostRepository,
    private val postLikeRepository: PostLikeRepository,
) {
    @Transactional(readOnly = true)
    fun getAllPosts(
        currentUserId: Long?,
        offset: Int,
        limit: Int,
        keyword: String?,
    ): PostsResponse {
        val safeLimit = limit.coerceIn(1, 100)
        val safeOffset = offset.coerceAtLeast(0)
        val pageIdx = safeOffset / safeLimit

        val spec = Specification<PostEntity> { root, _, cb ->
            val preds = mutableListOf<Predicate>()
            keyword?.trim()?.takeIf { it.isNotEmpty() }?.let { kw ->
                preds.add(cb.like(cb.lower(root.get("title")), "%${kw.lowercase()}%"))
            }
            if (preds.isEmpty()) null else cb.and(*preds.toTypedArray())
        }

        val page = postRepository.findAll(spec, PageRequest.of(pageIdx, safeLimit, POST_SORT))
        val items = page.content.map { post ->
            val isLiked = currentUserId?.let { postLikeRepository.existsByUserIdAndPostId(it, post.id) } ?: false
            PostResponse.from(post, isLiked)
        }
        return PostsResponse(
            items = items,
            total = page.totalElements,
            offset = pageIdx * safeLimit,
            limit = safeLimit,
        )
    }

    @Transactional
    fun getPost(id: Long, currentUserId: Long?): PostResponse {
        if (!postRepository.existsById(id)) {
            throw AppException.NotFound(ErrorCode.ARTICLE_NOT_FOUND)
        }
        postRepository.incrementViewCount(id)

        val post = postRepository.findById(id).orElseThrow {
            AppException.NotFound(ErrorCode.ARTICLE_NOT_FOUND)
        }
        val isLiked = currentUserId?.let { postLikeRepository.existsByUserIdAndPostId(it, id) } ?: false
        return PostResponse.from(post, isLiked)
    }

    @Transactional
    fun toggleLike(postId: Long, userId: Long) {
        val post = postRepository.findById(postId)
            .orElseThrow { AppException.NotFound(ErrorCode.ARTICLE_NOT_FOUND) }

        val existing = postLikeRepository.findByUserIdAndPostId(userId, postId)
        if (existing.isPresent) {
            postLikeRepository.delete(existing.get())
            post.likeCount = (post.likeCount - 1).coerceAtLeast(0)
        } else {
            postLikeRepository.save(PostLikeEntity(userId = userId, postId = postId))
            post.likeCount += 1
        }
    }
}
