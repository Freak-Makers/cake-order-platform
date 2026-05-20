package yjh.ontongsal.cakeorderplatform.service_api.reservation.presentation

data class PaymentConfirmRequest(
    val paymentKey: String,
    val orderId: String,
    val amount: Long,
)
