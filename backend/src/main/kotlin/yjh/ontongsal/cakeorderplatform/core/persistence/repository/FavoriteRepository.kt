package yjh.ontongsal.cakeorderplatform.core.persistence.repository

import org.springframework.data.jpa.repository.JpaRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.FavoriteEntity
import java.util.Optional

interface FavoriteRepository : JpaRepository<FavoriteEntity, Long> {
    fun findByUserIdAndProductId(userId: Long, productId: Long): Optional<FavoriteEntity>
    fun existsByUserIdAndProductId(userId: Long, productId: Long): Boolean
    fun findAllByUserIdOrderByCreatedAtDesc(userId: Long): List<FavoriteEntity>
}
