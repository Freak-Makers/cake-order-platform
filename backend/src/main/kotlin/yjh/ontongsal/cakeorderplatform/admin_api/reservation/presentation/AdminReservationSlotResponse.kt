package yjh.ontongsal.cakeorderplatform.admin_api.reservation.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationSlotEntity
import java.time.LocalDateTime

data class AdminReservationSlotResponse(
    val id: Long,
    val startAt: LocalDateTime,
) {
    companion object {
        fun from(entity: ReservationSlotEntity) = AdminReservationSlotResponse(
            id = entity.id,
            startAt = entity.startAt,
        )
    }
}
