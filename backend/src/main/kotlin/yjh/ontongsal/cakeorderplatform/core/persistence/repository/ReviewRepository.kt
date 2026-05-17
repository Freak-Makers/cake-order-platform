package yjh.ontongsal.cakeorderplatform.core.persistence.repository

import org.springframework.data.jpa.repository.JpaRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReviewEntity

interface ReviewRepository : JpaRepository<ReviewEntity, Long> {
    fun findAllByProductIdOrderByCreatedAtDesc(productId: Long): List<ReviewEntity>
}
