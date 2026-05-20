package yjh.ontongsal.cakeorderplatform.admin_api.reservation.presentation

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import yjh.ontongsal.cakeorderplatform.admin_api.reservation.application.AdminReservationService
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ReservationStatus

@RestController
@RequestMapping("/api/v1/admin/reservations")
class AdminReservationController(
    private val adminReservationService: AdminReservationService,
) {
    @GetMapping
    fun getReservations(
        @RequestParam(defaultValue = "0") offset: Int,
        @RequestParam(defaultValue = "20") limit: Int,
        @RequestParam(required = false) status: ReservationStatus?,
        @RequestParam(required = false) keyword: String?,
        @RequestParam(required = false) sort: String?,
        @RequestParam(required = false) direction: String?,
    ): ResponseEntity<AdminReservationsResponse> {
        return ResponseEntity.ok(
            adminReservationService.getReservations(offset, limit, status, keyword, sort, direction),
        )
    }

    @PostMapping("/{id}/confirm")
    fun confirmReservation(@PathVariable id: Long): ResponseEntity<AdminReservationResponse> {
        return ResponseEntity.ok(adminReservationService.confirmReservation(id))
    }

    @PostMapping("/{id}/cancel")
    fun cancelReservation(@PathVariable id: Long): ResponseEntity<AdminReservationResponse> {
        return ResponseEntity.ok(adminReservationService.cancelReservation(id))
    }
}
