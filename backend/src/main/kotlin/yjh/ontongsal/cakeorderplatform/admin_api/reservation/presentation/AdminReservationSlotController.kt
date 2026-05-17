package yjh.ontongsal.cakeorderplatform.admin_api.reservation.presentation

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import yjh.ontongsal.cakeorderplatform.admin_api.reservation.application.AdminReservationSlotService

@RestController
@RequestMapping("/api/v1/admin/reservation-slots")
class AdminReservationSlotController(
    private val adminReservationSlotService: AdminReservationSlotService,
) {
    @GetMapping
    fun getAllSlots(): ResponseEntity<List<AdminReservationSlotResponse>> {
        return ResponseEntity.ok(adminReservationSlotService.getAllSlots())
    }

    @PostMapping
    fun createSlots(@RequestBody request: AdminReservationSlotCreateRequest): ResponseEntity<List<AdminReservationSlotResponse>> {
        return ResponseEntity.ok(adminReservationSlotService.createSlots(request))
    }

    @DeleteMapping("/{id}")
    fun deleteSlot(@PathVariable id: Long): ResponseEntity<Unit> {
        adminReservationSlotService.deleteSlot(id)
        return ResponseEntity.ok().build()
    }
}
