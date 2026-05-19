package yjh.ontongsal.cakeorderplatform.service_api.reservation.presentation

import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import yjh.ontongsal.cakeorderplatform.core.security.TestingUserDetails
import yjh.ontongsal.cakeorderplatform.service_api.reservation.application.PaymentService

@RestController
@RequestMapping("/api/v1/payments")
class PaymentController(
    private val paymentService: PaymentService,
) {
    @PostMapping("/prepare")
    fun preparePayment(
        @AuthenticationPrincipal userDetails: TestingUserDetails,
        @RequestBody request: PaymentPrepareRequest,
    ): ResponseEntity<PaymentPrepareResponse> {
        return ResponseEntity.ok(paymentService.preparePayment(userDetails.userId, request.reservationId))
    }

    @PostMapping("/confirm")
    fun confirmPayment(
        @AuthenticationPrincipal userDetails: TestingUserDetails,
        @RequestBody request: PaymentConfirmRequest,
    ): ResponseEntity<PaymentResponse> {
        return ResponseEntity.ok(
            paymentService.confirmPayment(
                userId = userDetails.userId,
                paymentKey = request.paymentKey,
                orderId = request.orderId,
                amount = request.amount,
            )
        )
    }

    @PostMapping("/fail")
    fun failPayment(
        @AuthenticationPrincipal userDetails: TestingUserDetails,
        @RequestBody request: PaymentFailRequest,
    ): ResponseEntity<PaymentResponse> {
        return ResponseEntity.ok(paymentService.failPayment(userDetails.userId, request))
    }

    @GetMapping("/my")
    fun getMyPayments(
        @AuthenticationPrincipal userDetails: TestingUserDetails,
    ): ResponseEntity<List<PaymentResponse>> {
        return ResponseEntity.ok(paymentService.getMyPayments(userDetails.userId))
    }

    @GetMapping("/by-reservation/{reservationId}")
    fun getPaymentByReservation(
        @AuthenticationPrincipal userDetails: TestingUserDetails,
        @PathVariable reservationId: Long,
    ): ResponseEntity<PaymentResponse?> {
        return ResponseEntity.ok(paymentService.getPaymentByReservation(userDetails.userId, reservationId))
    }
}
