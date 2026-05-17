package yjh.ontongsal.cakeorderplatform.admin_api.order.presentation

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import yjh.ontongsal.cakeorderplatform.admin_api.order.application.AdminOrderService

@RestController
@RequestMapping("/api/v1/admin/orders")
class AdminOrderController(
    private val adminOrderService: AdminOrderService,
) {
    @GetMapping
    fun getAllOrders(): ResponseEntity<List<AdminOrderResponse>> {
        return ResponseEntity.ok(adminOrderService.getAllOrders())
    }

    @PostMapping("/{id}/status")
    fun updateOrderStatus(
        @PathVariable id: Long,
        @RequestBody request: OrderStatusUpdateRequest,
    ): ResponseEntity<AdminOrderResponse> {
        return ResponseEntity.ok(adminOrderService.updateOrderStatus(id, request.status))
    }
}
