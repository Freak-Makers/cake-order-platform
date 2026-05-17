package yjh.ontongsal.cakeorderplatform.admin_api.reservation.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationStatus
import java.time.LocalDateTime

data class AdminReservationResponse(
    val id: Long,
    val reservationNumber: String,
    val productId: Long,
    val productName: String,
    val customerName: String,
    val slotId: Long,
    val slotStartAt: LocalDateTime,
    val quantity: Int,
    val totalPrice: Long,
    val requirements: String?,
    val status: ReservationStatus,
    val createdAt: LocalDateTime,
) {
    companion object {
        fun from(
            entity: ReservationEntity,
            productName: String,
            customerName: String,
            slotStartAt: LocalDateTime,
        ) = AdminReservationResponse(
            id = entity.id,
            reservationNumber = entity.reservationNumber,
            productId = entity.productId,
            productName = productName,
            customerName = customerName,
            slotId = entity.slotId,
            slotStartAt = slotStartAt,
            quantity = entity.quantity,
            totalPrice = entity.totalPrice,
            requirements = entity.requirements,
            status = entity.status,
            createdAt = entity.createdAt,
        )
    }
}
