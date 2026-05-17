package yjh.ontongsal.cakeorderplatform.service_api.reservation.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.PaymentEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.PaymentStatus
import java.time.LocalDateTime

data class PaymentResponse(
    val id: Long,
    val reservationId: Long,
    val amount: Long,
    val status: PaymentStatus,
    val paidAt: LocalDateTime?,
    val paymentKey: String?,
    val orderId: String?,
    val createdAt: LocalDateTime,
) {
    companion object {
        fun from(entity: PaymentEntity) = PaymentResponse(
            id = entity.id,
            reservationId = entity.reservationId,
            amount = entity.amount,
            status = entity.status,
            paidAt = entity.paidAt,
            paymentKey = entity.paymentKey,
            orderId = entity.orderId,
            createdAt = entity.createdAt,
        )
    }
}
