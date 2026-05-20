package yjh.ontongsal.cakeorderplatform.service_api.reservation.presentation

import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import yjh.ontongsal.cakeorderplatform.core.security.TestingUserDetails
import yjh.ontongsal.cakeorderplatform.service_api.reservation.application.ReservationService

@RestController
@RequestMapping("/api/v1/reservations")
class ReservationController(
    private val reservationService: ReservationService,
) {
    @PostMapping
    fun createReservation(
        @AuthenticationPrincipal userDetails: TestingUserDetails,
        @RequestBody request: ReservationCreateRequest,
    ): ResponseEntity<ReservationResponse> {
        return ResponseEntity.ok(reservationService.createReservation(userDetails.userId, request))
    }

    @GetMapping("/my")
    fun getMyReservations(
        @AuthenticationPrincipal userDetails: TestingUserDetails,
    ): ResponseEntity<List<ReservationResponse>> {
        return ResponseEntity.ok(reservationService.getMyReservations(userDetails.userId))
    }

    @PostMapping("/{id}/cancel")
    fun cancelReservation(
        @AuthenticationPrincipal userDetails: TestingUserDetails,
        @PathVariable id: Long,
    ): ResponseEntity<ReservationResponse> {
        return ResponseEntity.ok(reservationService.cancelReservation(userDetails.userId, id))
    }
}
