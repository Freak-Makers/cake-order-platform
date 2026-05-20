package yjh.ontongsal.cakeorderplatform.service_api.reservation.presentation

data class PaymentFailRequest(
    val reservationId: Long,
    val paymentKey: String? = null,
    val orderId: String? = null,
    val code: String,
    val message: String,
)
