package yjh.ontongsal.cakeorderplatform.core.persistence.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.PaymentEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.PaymentStatus

interface PaymentRepository : JpaRepository<PaymentEntity, Long> {
    fun findAllByUserIdOrderByCreatedAtDesc(userId: Long): List<PaymentEntity>

    // 한 예약에 여러 시도(FAILED N건 + PAID 1건)가 누적될 수 있으므로 가장 최근 row 반환.
    fun findFirstByReservationIdOrderByCreatedAtDesc(reservationId: Long): PaymentEntity?

    // prepare/confirm 에서 PAID row 가 이미 있는지(=재결제 차단 조건)만 검사.
    fun existsByReservationIdAndStatus(reservationId: Long, status: PaymentStatus): Boolean

    // 대시보드 통계 — 특정 status 의 amount 총합. 없으면 null → 호출자가 0 보정.
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentEntity p WHERE p.status = :status")
    fun sumAmountByStatus(@Param("status") status: PaymentStatus): Long

    // 대시보드 통계 — 특정 status 결제를 한 고유 userId 개수.
    @Query("SELECT COUNT(DISTINCT p.userId) FROM PaymentEntity p WHERE p.status = :status")
    fun countDistinctUserIdByStatus(@Param("status") status: PaymentStatus): Long
}
