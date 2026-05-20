package yjh.ontongsal.cakeorderplatform.admin_api.reservation.presentation

data class AdminReservationsResponse(
    val items: List<AdminReservationResponse>,
    val total: Long,
    val offset: Int,
    val limit: Int,
)
