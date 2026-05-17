package yjh.ontongsal.cakeorderplatform.core.persistence.repository

import org.springframework.data.jpa.repository.JpaRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReviewLikeEntity
import java.util.*

interface ReviewLikeRepository : JpaRepository<ReviewLikeEntity, Long> {
    fun findByUserIdAndReviewId(userId: Long, reviewId: Long): Optional<ReviewLikeEntity>
    fun existsByUserIdAndReviewId(userId: Long, reviewId: Long): Boolean
}
