package yjh.ontongsal.cakeorderplatform.core.persistence.repository

import org.springframework.data.jpa.repository.JpaRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.PaymentEntity
import java.util.*

interface PaymentRepository : JpaRepository<PaymentEntity, Long> {
    fun findAllByUserIdOrderByCreatedAtDesc(userId: Long): List<PaymentEntity>
    fun findByReservationId(reservationId: Long): Optional<PaymentEntity>
}
