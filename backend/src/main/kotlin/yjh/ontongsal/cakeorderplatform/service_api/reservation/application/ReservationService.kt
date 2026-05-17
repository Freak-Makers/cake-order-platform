package yjh.ontongsal.cakeorderplatform.service_api.reservation.application

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.core.exception.AppException
import yjh.ontongsal.cakeorderplatform.core.exception.ErrorCode
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationStatus
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ProductRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ReservationRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ReservationSlotRepository
import yjh.ontongsal.cakeorderplatform.service_api.reservation.presentation.ReservationCreateRequest
import yjh.ontongsal.cakeorderplatform.service_api.reservation.presentation.ReservationResponse
import yjh.ontongsal.cakeorderplatform.service_api.reservation.presentation.ReservationSlotResponse
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*

@Service
class ReservationService(
    private val reservationRepository: ReservationRepository,
    private val reservationSlotRepository: ReservationSlotRepository,
    private val productRepository: ProductRepository,
) {
    @Transactional(readOnly = true)
    fun getAvailableSlots(): List<ReservationSlotResponse> {
        val usedSlotIds = takenSlotIds()
        val now = LocalDateTime.now()
        return reservationSlotRepository.findAllByOrderByStartAtAsc()
            .filter { it.startAt.isAfter(now) && it.id !in usedSlotIds }
            .map { ReservationSlotResponse.from(it) }
    }

    @Transactional
    fun createReservation(userId: Long, request: ReservationCreateRequest): ReservationResponse {
        val product = productRepository.findById(request.productId)
            .orElseThrow { AppException.NotFound(ErrorCode.ARTICLE_NOT_FOUND, "상품을 찾을 수 없습니다") }
        val slot = reservationSlotRepository.findById(request.slotId)
            .orElseThrow { AppException.NotFound(ErrorCode.RESERVATION_SLOT_NOT_FOUND) }

        if (slot.id in takenSlotIds()) {
            throw AppException.Conflict(ErrorCode.RESERVATION_SLOT_TAKEN)
        }

        val reservationNumber = "RES-${LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))}-${UUID.randomUUID().toString().substring(0, 8)}"

        val saved = reservationRepository.save(
            ReservationEntity(
                reservationNumber = reservationNumber,
                userId = userId,
                productId = product.id,
                slotId = slot.id,
                quantity = request.quantity,
                totalPrice = product.price * request.quantity,
                requirements = request.requirements,
                status = ReservationStatus.REQUESTED,
            )
        )
        return ReservationResponse.from(saved, product.name, slot.startAt)
    }

    @Transactional(readOnly = true)
    fun getMyReservations(userId: Long): List<ReservationResponse> {
        return reservationRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
            .map { toResponse(it) }
    }

    private fun toResponse(entity: ReservationEntity): ReservationResponse {
        val product = productRepository.findById(entity.productId).orElse(null)
        val slot = reservationSlotRepository.findById(entity.slotId).orElse(null)
        return ReservationResponse.from(
            entity = entity,
            productName = product?.name ?: "Unknown Product",
            slotStartAt = slot?.startAt ?: LocalDateTime.MIN,
        )
    }

    private fun takenSlotIds(): Set<Long> {
        return reservationRepository.findAll()
            .filter { it.status != ReservationStatus.CANCELLED }
            .map { it.slotId }
            .toSet()
    }
}
