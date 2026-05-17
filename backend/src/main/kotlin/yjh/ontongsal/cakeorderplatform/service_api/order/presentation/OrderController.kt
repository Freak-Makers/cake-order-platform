package yjh.ontongsal.cakeorderplatform.service_api.order.presentation

import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import yjh.ontongsal.cakeorderplatform.core.security.TestingUserDetails
import yjh.ontongsal.cakeorderplatform.service_api.order.application.OrderService

@RestController
@RequestMapping("/api/v1/orders")
class OrderController(
    private val orderService: OrderService,
) {
    @PostMapping
    fun createOrder(
        @AuthenticationPrincipal userDetails: TestingUserDetails,
        @RequestBody request: OrderCreateRequest,
    ): ResponseEntity<Map<String, Long>> {
        val orderId = orderService.createOrder(userDetails.userId, request)
        return ResponseEntity.ok(mapOf("orderId" to orderId))
    }

    @GetMapping("/my")
    fun getMyOrders(@AuthenticationPrincipal userDetails: TestingUserDetails): ResponseEntity<List<OrderResponse>> {
        return ResponseEntity.ok(orderService.getMyOrders(userDetails.userId))
    }
}
