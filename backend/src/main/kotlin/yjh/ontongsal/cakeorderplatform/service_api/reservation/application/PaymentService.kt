package yjh.ontongsal.cakeorderplatform.service_api.reservation.application

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.core.client.toss.TossPaymentsClient
import yjh.ontongsal.cakeorderplatform.core.exception.AppException
import yjh.ontongsal.cakeorderplatform.core.exception.ErrorCode
import yjh.ontongsal.cakeorderplatform.core.notification.application.NotifyEvent
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.NotificationType
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.PaymentEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.PaymentStatus
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationStatus
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.PaymentRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ProductRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ReservationRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.UserRepository
import yjh.ontongsal.cakeorderplatform.service_api.reservation.presentation.PaymentFailRequest
import yjh.ontongsal.cakeorderplatform.service_api.reservation.presentation.PaymentPrepareResponse
import yjh.ontongsal.cakeorderplatform.service_api.reservation.presentation.PaymentResponse
import java.time.LocalDateTime

// AdminLoginService 가 항상 userId=1 로 JWT 를 발급하므로 알림 수신자는 1L 고정.
private const val ADMIN_USER_ID: Long = 1L

@Service
class PaymentService(
    private val paymentRepository: PaymentRepository,
    private val reservationRepository: ReservationRepository,
    private val productRepository: ProductRepository,
    private val userRepository: UserRepository,
    private val tossPaymentsClient: TossPaymentsClient,
    private val eventPublisher: ApplicationEventPublisher,

    @Value("\${toss.client-key}")
    private val tossClientKey: String,
    @Value("\${payment.success-url}")
    private val successUrl: String,
    @Value("\${payment.fail-url}")
    private val failUrl: String,
    @Value("\${payment.mock:false}")
    private val paymentMock: Boolean,
) {
    @Transactional(readOnly = true)
    fun preparePayment(userId: Long, reservationId: Long): PaymentPrepareResponse {
        val reservation = reservationRepository.findById(reservationId)
            .orElseThrow { AppException.NotFound(ErrorCode.RESERVATION_NOT_FOUND) }

        if (reservation.userId != userId) {
            throw AppException.Forbidden(ErrorCode.RESERVATION_FORBIDDEN)
        }
        if (reservation.status != ReservationStatus.CONFIRMED) {
            throw AppException.BadRequest(
                ErrorCode.INVALID_RESERVATION_STATUS,
                "확정된 예약만 결제할 수 있습니다 (현재 상태: ${reservation.status})"
            )
        }
        if (paymentRepository.existsByReservationIdAndStatus(reservationId, PaymentStatus.PAID)) {
            throw AppException.Conflict(ErrorCode.INVALID_RESERVATION_STATUS, "이미 결제된 예약입니다")
        }

        val product = productRepository.findById(reservation.productId).orElse(null)
        val user = userRepository.findById(userId).orElse(null)
        val orderName = (product?.name ?: "케이크 예약") +
            if (reservation.quantity > 1) " 외 ${reservation.quantity - 1}건" else ""

        return PaymentPrepareResponse(
            clientKey = tossClientKey,
            customerKey = "user-$userId",
            orderId = reservation.reservationNumber,
            amount = reservation.totalPrice,
            orderName = orderName,
            customerName = user?.nickname ?: "고객",
            successUrl = successUrl,
            // 실패 페이지가 어느 예약 건인지 식별할 수 있도록 reservationId 부착. 토스가 code/message/orderId 를 추가로 붙임.
            failUrl = appendReservationIdQuery(failUrl, reservation.id),
        )
    }

    @Transactional
    fun confirmPayment(userId: Long, paymentKey: String, orderId: String, amount: Long): PaymentResponse {
        val reservation = reservationRepository.findAll()
            .firstOrNull { it.reservationNumber == orderId }
            ?: throw AppException.NotFound(ErrorCode.RESERVATION_NOT_FOUND, "orderId 에 해당하는 예약이 없습니다")

        if (reservation.userId != userId) {
            throw AppException.Forbidden(ErrorCode.RESERVATION_FORBIDDEN)
        }
        if (reservation.status != ReservationStatus.CONFIRMED) {
            throw AppException.BadRequest(
                ErrorCode.INVALID_RESERVATION_STATUS,
                "확정 상태(CONFIRMED) 예약만 결제 승인할 수 있습니다 (현재: ${reservation.status})"
            )
        }
        if (reservation.totalPrice != amount) {
            throw AppException.BadRequest(ErrorCode.PAYMENT_AMOUNT_MISMATCH)
        }
        if (paymentRepository.existsByReservationIdAndStatus(reservation.id, PaymentStatus.PAID)) {
            throw AppException.Conflict(ErrorCode.INVALID_RESERVATION_STATUS, "이미 결제된 예약입니다")
        }

        // payment.mock=true 일 때는 Toss 외부 호출/검증 생략. 흐름 시뮬레이션 용.
        if (!paymentMock) {
            val tossResponse = tossPaymentsClient.confirmPayment(paymentKey, orderId, amount)
            if (tossResponse.status != "DONE") {
                throw AppException.BadRequest(
                    ErrorCode.PAYMENT_VERIFICATION_FAILED,
                    "토스 응답 status=${tossResponse.status}"
                )
            }
        }

        val payment = paymentRepository.save(
            PaymentEntity(
                reservationId = reservation.id,
                userId = userId,
                amount = amount,
                status = PaymentStatus.PAID,
                paidAt = LocalDateTime.now(),
                paymentKey = paymentKey,
                orderId = orderId,
            )
        )
        reservation.status = ReservationStatus.PAID

        val customerNickname = userRepository.findById(userId).map { it.nickname }.orElse("고객")
        val productName = productRepository.findById(reservation.productId).map { it.name }.orElse("상품")
        eventPublisher.publishEvent(
            NotifyEvent(
                recipientUserId = ADMIN_USER_ID,
                type = NotificationType.PAYMENT_COMPLETED,
                title = "결제 완료",
                body = "${customerNickname}님이 ${productName} 결제를 완료했습니다. (₩${"%,d".format(amount)})",
                linkUrl = "/admin/reservations",
            )
        )
        return PaymentResponse.from(payment)
    }

    @Transactional
    fun failPayment(userId: Long, request: PaymentFailRequest): PaymentResponse {
        val reservation = reservationRepository.findById(request.reservationId)
            .orElseThrow { AppException.NotFound(ErrorCode.RESERVATION_NOT_FOUND) }

        if (reservation.userId != userId) {
            throw AppException.Forbidden(ErrorCode.RESERVATION_FORBIDDEN)
        }
        if (paymentRepository.existsByReservationIdAndStatus(reservation.id, PaymentStatus.PAID)) {
            throw AppException.BadRequest(
                ErrorCode.INVALID_RESERVATION_STATUS,
                "이미 결제 완료된 예약에는 실패 기록을 남길 수 없습니다"
            )
        }

        val payment = paymentRepository.save(
            PaymentEntity(
                reservationId = reservation.id,
                userId = userId,
                amount = reservation.totalPrice,
                status = PaymentStatus.FAILED,
                paidAt = null,
                paymentKey = request.paymentKey,
                orderId = request.orderId,
                failureCode = request.code,
                failureMessage = request.message.take(510),
            )
        )
        return PaymentResponse.from(payment)
    }

    @Transactional(readOnly = true)
    fun getMyPayments(userId: Long): List<PaymentResponse> {
        return paymentRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
            .map { PaymentResponse.from(it) }
    }

    @Transactional(readOnly = true)
    fun getPaymentByReservation(userId: Long, reservationId: Long): PaymentResponse? {
        val reservation = reservationRepository.findById(reservationId)
            .orElseThrow { AppException.NotFound(ErrorCode.RESERVATION_NOT_FOUND) }

        if (reservation.userId != userId) {
            throw AppException.Forbidden(ErrorCode.RESERVATION_FORBIDDEN)
        }
        return paymentRepository.findFirstByReservationIdOrderByCreatedAtDesc(reservationId)
            ?.let { PaymentResponse.from(it) }
    }

    private fun appendReservationIdQuery(url: String, reservationId: Long): String {
        val separator = if (url.contains("?")) "&" else "?"
        return "$url${separator}reservationId=$reservationId"
    }
}
