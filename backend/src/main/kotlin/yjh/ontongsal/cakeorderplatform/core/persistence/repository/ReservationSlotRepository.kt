package yjh.ontongsal.cakeorderplatform.core.persistence.repository

import org.springframework.data.jpa.repository.JpaRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationSlotEntity

interface ReservationSlotRepository : JpaRepository<ReservationSlotEntity, Long> {
    fun findAllByOrderByStartAtAsc(): List<ReservationSlotEntity>
}
