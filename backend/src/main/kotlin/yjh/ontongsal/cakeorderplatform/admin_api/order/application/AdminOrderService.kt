package yjh.ontongsal.cakeorderplatform.admin_api.order.application

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.admin_api.order.presentation.AdminOrderResponse
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.OrderEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.OrderStatus
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.OrderRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ProductRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.UserRepository

@Service
class AdminOrderService(
    private val orderRepository: OrderRepository,
    private val productRepository: ProductRepository,
    private val userRepository: UserRepository,
) {
    @Transactional(readOnly = true)
    fun getAllOrders(): List<AdminOrderResponse> {
        return orderRepository.findAll().map { toResponse(it) }
    }

    @Transactional
    fun updateOrderStatus(orderId: Long, status: OrderStatus): AdminOrderResponse {
        val order = orderRepository.findById(orderId)
            .orElseThrow { IllegalArgumentException("Order not found") }
        order.status = status
        return toResponse(order)
    }

    private fun toResponse(entity: OrderEntity): AdminOrderResponse {
        val product = productRepository.findById(entity.productId).orElse(null)
        val user = userRepository.findById(entity.userId).orElse(null)

        return AdminOrderResponse.from(
            entity = entity,
            productName = product?.name ?: "Unknown Product",
            customerName = user?.nickname ?: "Unknown User"
        )
    }
}
