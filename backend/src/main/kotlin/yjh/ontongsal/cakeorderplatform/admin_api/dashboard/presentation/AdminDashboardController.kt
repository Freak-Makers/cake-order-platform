package yjh.ontongsal.cakeorderplatform.admin_api.dashboard.presentation

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import yjh.ontongsal.cakeorderplatform.admin_api.dashboard.application.AdminDashboardService

@RestController
@RequestMapping("/api/v1/admin/dashboard")
class AdminDashboardController(
    private val adminDashboardService: AdminDashboardService,
) {
    @GetMapping("/stats")
    fun getStats(): ResponseEntity<AdminDashboardStatsResponse> {
        return ResponseEntity.ok(adminDashboardService.getStats())
    }
}
