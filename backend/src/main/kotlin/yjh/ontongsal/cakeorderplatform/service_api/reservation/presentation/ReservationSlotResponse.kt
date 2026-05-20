package yjh.ontongsal.cakeorderplatform.service_api.reservation.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationSlotEntity
import java.time.LocalDateTime

data class ReservationSlotResponse(
    val id: Long,
    val startAt: LocalDateTime,
) {
    companion object {
        fun from(entity: ReservationSlotEntity) = ReservationSlotResponse(
            id = entity.id,
            startAt = entity.startAt,
        )
    }
}
