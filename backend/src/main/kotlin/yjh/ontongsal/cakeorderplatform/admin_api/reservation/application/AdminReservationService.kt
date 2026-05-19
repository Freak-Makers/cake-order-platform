package yjh.ontongsal.cakeorderplatform.admin_api.reservation.application

import jakarta.persistence.criteria.Predicate
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.admin_api.reservation.presentation.AdminReservationResponse
import yjh.ontongsal.cakeorderplatform.admin_api.reservation.presentation.AdminReservationsResponse
import yjh.ontongsal.cakeorderplatform.core.exception.AppException
import yjh.ontongsal.cakeorderplatform.core.exception.ErrorCode
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationStatus
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ProductRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ReservationRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ReservationSlotRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.UserRepository
import java.time.LocalDateTime

@Service
class AdminReservationService(
    private val reservationRepository: ReservationRepository,
    private val reservationSlotRepository: ReservationSlotRepository,
    private val productRepository: ProductRepository,
    private val userRepository: UserRepository,
) {
    @Transactional(readOnly = true)
    fun getReservations(
        offset: Int,
        limit: Int,
        status: ReservationStatus?,
        keyword: String?,
        sort: String?,
        direction: String?,
    ): AdminReservationsResponse {
        val safeLimit = limit.coerceIn(1, 100)
        val safeOffset = offset.coerceAtLeast(0)
        val pageIdx = safeOffset / safeLimit
        val normalizedKeyword = keyword?.trim()?.takeIf { it.isNotEmpty() }
        val isAsc = direction.equals("asc", ignoreCase = true)
        val sortDirection = if (isAsc) Sort.Direction.ASC else Sort.Direction.DESC

        val page: Page<ReservationEntity> = if (sort == "slotStartAt") {
            // slot.startAt 정렬은 theta-join + JPQL 내부 ORDER BY 전용 메서드 사용.
            val pageable: Pageable = PageRequest.of(pageIdx, safeLimit)
            if (isAsc) {
                reservationRepository.searchBySlotStartAtAsc(status, normalizedKeyword, pageable)
            } else {
                reservationRepository.searchBySlotStartAtDesc(status, normalizedKeyword, pageable)
            }
        } else {
            // 그 외 필드는 Specification + Sort.by 로 처리.
            val sortField = resolveEntitySortField(sort)
            val pageable = PageRequest.of(pageIdx, safeLimit, Sort.by(sortDirection, sortField))
            reservationRepository.findAll(buildSpec(status, normalizedKeyword), pageable)
        }

        return AdminReservationsResponse(
            items = page.content.map { toResponse(it) },
            total = page.totalElements,
            offset = pageIdx * safeLimit,
            limit = safeLimit,
        )
    }

    private fun buildSpec(status: ReservationStatus?, keyword: String?): Specification<ReservationEntity> =
        Specification { root, _, cb ->
            val preds = mutableListOf<Predicate>()
            status?.let { preds.add(cb.equal(root.get<ReservationStatus>("status"), it)) }
            keyword?.let { kw ->
                preds.add(
                    cb.like(
                        cb.lower(root.get("reservationNumber")),
                        "%${kw.lowercase()}%",
                    ),
                )
            }
            if (preds.isEmpty()) null else cb.and(*preds.toTypedArray())
        }

    // ReservationEntity 의 직접 필드 화이트리스트. slotStartAt 은 별도 경로에서 처리.
    private fun resolveEntitySortField(sort: String?): String = when (sort) {
        "createdAt" -> "createdAt"
        "quantity" -> "quantity"
        "totalPrice" -> "totalPrice"
        "status" -> "status"
        else -> "createdAt"
    }

    @Transactional
    fun confirmReservation(id: Long): AdminReservationResponse {
        val reservation = reservationRepository.findById(id)
            .orElseThrow { AppException.NotFound(ErrorCode.RESERVATION_NOT_FOUND) }
        if (reservation.status != ReservationStatus.REQUESTED) {
            throw AppException.BadRequest(
                ErrorCode.INVALID_RESERVATION_STATUS,
                "신청 상태(REQUESTED)인 예약만 확정할 수 있습니다 (현재 상태: ${reservation.status})"
            )
        }
        reservation.status = ReservationStatus.CONFIRMED
        return toResponse(reservation)
    }

    @Transactional
    fun cancelReservation(id: Long): AdminReservationResponse {
        val reservation = reservationRepository.findById(id)
            .orElseThrow { AppException.NotFound(ErrorCode.RESERVATION_NOT_FOUND) }
        if (reservation.status == ReservationStatus.CANCELLED) {
            throw AppException.BadRequest(
                ErrorCode.INVALID_RESERVATION_STATUS,
                "이미 취소된 예약입니다",
            )
        }
        // 관리자는 PAID 도 취소 가능. PAID 의 경우 결제는 그대로 — 환불은 별도 절차에서 처리.
        reservation.status = ReservationStatus.CANCELLED
        return toResponse(reservation)
    }

    private fun toResponse(entity: ReservationEntity): AdminReservationResponse {
        val product = productRepository.findById(entity.productId).orElse(null)
        val user = userRepository.findById(entity.userId).orElse(null)
        val slot = reservationSlotRepository.findById(entity.slotId).orElse(null)
        return AdminReservationResponse.from(
            entity = entity,
            productName = product?.name ?: "Unknown Product",
            customerName = user?.nickname ?: "Unknown User",
            slotStartAt = slot?.startAt ?: LocalDateTime.MIN,
        )
    }
}
