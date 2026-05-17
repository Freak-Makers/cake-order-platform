package yjh.ontongsal.cakeorderplatform.admin_api.order.presentation

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import yjh.ontongsal.cakeorderplatform.service_api.order.application.OrderService
import yjh.ontongsal.cakeorderplatform.service_api.order.presentation.OrderResponse

@RestController
@RequestMapping("/api/v1/admin/orders")
class AdminOrderController(
    private val orderService: OrderService,
) {
    @GetMapping
    fun getAllOrders(): ResponseEntity<List<OrderResponse>> {
        return ResponseEntity.ok(orderService.getAllOrders())
    }

    @PostMapping("/{id}/status")
    fun updateOrderStatus(
        @PathVariable id: Long,
        @RequestBody request: OrderStatusUpdateRequest,
    ): ResponseEntity<OrderResponse> {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request.status))
    }
}
