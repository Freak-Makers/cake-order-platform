package yjh.ontongsal.cakeorderplatform.service_api.reservation.presentation

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import yjh.ontongsal.cakeorderplatform.service_api.reservation.application.ReservationService

@RestController
@RequestMapping("/api/v1/reservation-slots")
class ReservationSlotController(
    private val reservationService: ReservationService,
) {
    @GetMapping
    fun getAvailableSlots(): ResponseEntity<List<ReservationSlotResponse>> {
        return ResponseEntity.ok(reservationService.getAvailableSlots())
    }
}
