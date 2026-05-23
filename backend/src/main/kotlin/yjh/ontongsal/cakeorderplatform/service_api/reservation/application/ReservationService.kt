package yjh.ontongsal.cakeorderplatform.service_api.reservation.application

import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.core.exception.AppException
import yjh.ontongsal.cakeorderplatform.core.exception.ErrorCode
import yjh.ontongsal.cakeorderplatform.core.notification.application.NotifyEvent
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.NotificationType
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationStatus
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ProductRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ReservationRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ReservationSlotRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.UserRepository
import yjh.ontongsal.cakeorderplatform.service_api.reservation.presentation.ReservationCreateRequest
import yjh.ontongsal.cakeorderplatform.service_api.reservation.presentation.ReservationResponse
import yjh.ontongsal.cakeorderplatform.service_api.reservation.presentation.ReservationSlotResponse
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*

// AdminLoginService 가 항상 userId=1 로 JWT 를 발급하므로 알림 수신자는 1L 고정.
private const val ADMIN_USER_ID: Long = 1L

@Service
class ReservationService(
    private val reservationRepository: ReservationRepository,
    private val reservationSlotRepository: ReservationSlotRepository,
    private val productRepository: ProductRepository,
    private val userRepository: UserRepository,
    private val eventPublisher: ApplicationEventPublisher,
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

        val customerNickname = userRepository.findById(userId).map { it.nickname }.orElse("고객")
        eventPublisher.publishEvent(
            NotifyEvent(
                recipientUserId = ADMIN_USER_ID,
                type = NotificationType.RESERVATION_CREATED,
                title = "새 예약 요청",
                body = "${customerNickname}님이 ${product.name} ${request.quantity}개 예약을 요청했습니다.",
                linkUrl = "/admin/reservations",
            )
        )
        return ReservationResponse.from(saved, product.name, slot.startAt)
    }

    @Transactional(readOnly = true)
    fun getMyReservations(userId: Long): List<ReservationResponse> {
        return reservationRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
            .map { toResponse(it) }
    }

    @Transactional
    fun cancelReservation(userId: Long, reservationId: Long): ReservationResponse {
        val reservation = reservationRepository.findById(reservationId)
            .orElseThrow { AppException.NotFound(ErrorCode.RESERVATION_NOT_FOUND) }
        if (reservation.userId != userId) {
            throw AppException.Forbidden(ErrorCode.RESERVATION_FORBIDDEN)
        }
        // 사용자는 REQUESTED / CONFIRMED 만 취소 가능. PAID 이후는 환불 흐름 필요 → 별도 처리.
        if (reservation.status != ReservationStatus.REQUESTED && reservation.status != ReservationStatus.CONFIRMED) {
            throw AppException.BadRequest(
                ErrorCode.INVALID_RESERVATION_STATUS,
                "현재 상태(${reservation.status})에서는 취소할 수 없습니다. 결제 완료된 예약은 별도 환불 절차가 필요합니다.",
            )
        }
        reservation.status = ReservationStatus.CANCELLED

        val customerNickname = userRepository.findById(reservation.userId).map { it.nickname }.orElse("고객")
        val productName = productRepository.findById(reservation.productId).map { it.name }.orElse("상품")
        eventPublisher.publishEvent(
            NotifyEvent(
                recipientUserId = ADMIN_USER_ID,
                type = NotificationType.RESERVATION_CANCELLED,
                title = "예약 취소",
                body = "${customerNickname}님이 ${productName} 예약을 취소했습니다.",
                linkUrl = "/admin/reservations",
            )
        )
        return toResponse(reservation)
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
