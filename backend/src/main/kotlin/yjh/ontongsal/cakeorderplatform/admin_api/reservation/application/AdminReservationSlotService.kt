package yjh.ontongsal.cakeorderplatform.admin_api.reservation.application

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.admin_api.reservation.presentation.AdminReservationSlotCreateRequest
import yjh.ontongsal.cakeorderplatform.admin_api.reservation.presentation.AdminReservationSlotResponse
import yjh.ontongsal.cakeorderplatform.core.exception.AppException
import yjh.ontongsal.cakeorderplatform.core.exception.ErrorCode
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationSlotEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ReservationSlotRepository

@Service
class AdminReservationSlotService(
    private val reservationSlotRepository: ReservationSlotRepository,
) {
    @Transactional(readOnly = true)
    fun getAllSlots(): List<AdminReservationSlotResponse> {
        return reservationSlotRepository.findAllByOrderByStartAtAsc()
            .map { AdminReservationSlotResponse.from(it) }
    }

    @Transactional
    fun createSlots(request: AdminReservationSlotCreateRequest): List<AdminReservationSlotResponse> {
        if (request.times.isEmpty()) {
            throw AppException.BadRequest(ErrorCode.RESERVATION_SLOT_NOT_FOUND, "시간이 비어있습니다")
        }
        // @SQLRestriction 으로 활성 슬롯만 자동 반환 → 중복 검사도 active 만 기준
        val existing = reservationSlotRepository.findAllByOrderByStartAtAsc()
            .map { it.startAt }
            .toSet()

        return request.times.distinct()
            .map { request.date.atTime(it) }
            .filter { it !in existing }
            .map { startAt ->
                AdminReservationSlotResponse.from(
                    reservationSlotRepository.save(ReservationSlotEntity(startAt = startAt))
                )
            }
    }

    @Transactional
    fun deleteSlot(id: Long) {
        if (!reservationSlotRepository.existsById(id)) {
            throw AppException.NotFound(ErrorCode.RESERVATION_SLOT_NOT_FOUND)
        }
        reservationSlotRepository.deleteById(id)
    }
}
