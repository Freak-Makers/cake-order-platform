package yjh.ontongsal.cakeorderplatform.service_api.order.presentation

import java.time.LocalDateTime

data class OrderCreateRequest(
    val productId: Long,
    val quantity: Int,
    val pickupDateTime: LocalDateTime,
    val requirements: String?,
)
