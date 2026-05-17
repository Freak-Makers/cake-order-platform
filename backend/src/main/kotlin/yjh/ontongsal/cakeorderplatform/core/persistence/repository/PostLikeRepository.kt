package yjh.ontongsal.cakeorderplatform.core.persistence.repository

import org.springframework.data.jpa.repository.JpaRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.PostLikeEntity
import java.util.*

interface PostLikeRepository : JpaRepository<PostLikeEntity, Long> {
    fun findByUserIdAndPostId(userId: Long, postId: Long): Optional<PostLikeEntity>
    fun existsByUserIdAndPostId(userId: Long, postId: Long): Boolean
    fun deleteAllByPostId(postId: Long)
}
