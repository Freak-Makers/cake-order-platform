package yjh.ontongsal.cakeorderplatform.admin_api.reservation.presentation

import java.time.LocalDate
import java.time.LocalTime

data class AdminReservationSlotCreateRequest(
    val date: LocalDate,
    val times: List<LocalTime>,
)
