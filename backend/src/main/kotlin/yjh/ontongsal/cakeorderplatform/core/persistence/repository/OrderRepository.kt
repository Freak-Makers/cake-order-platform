package yjh.ontongsal.cakeorderplatform.core.persistence.repository

import org.springframework.data.jpa.repository.JpaRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.OrderEntity

interface OrderRepository : JpaRepository<OrderEntity, Long> {
    fun findAllByUserId(userId: Long): List<OrderEntity>
}
