package yjh.ontongsal.cakeorderplatform.service_api.reservation.presentation

data class PaymentPrepareResponse(
    val clientKey: String,
    val customerKey: String,
    val orderId: String,
    val amount: Long,
    val orderName: String,
    val customerName: String,
    val successUrl: String,
    val failUrl: String,
)
