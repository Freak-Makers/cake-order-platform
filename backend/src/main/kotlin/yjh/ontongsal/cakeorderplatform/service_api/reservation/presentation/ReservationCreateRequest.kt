package yjh.ontongsal.cakeorderplatform.service_api.reservation.presentation

data class ReservationCreateRequest(
    val productId: Long,
    val slotId: Long,
    val quantity: Int,
    val requirements: String? = null,
)
