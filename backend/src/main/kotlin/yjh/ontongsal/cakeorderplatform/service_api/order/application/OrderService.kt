package yjh.ontongsal.cakeorderplatform.service_api.order.application

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.OrderEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.OrderStatus
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.OrderRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ProductRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.UserRepository
import yjh.ontongsal.cakeorderplatform.service_api.order.presentation.OrderCreateRequest
import yjh.ontongsal.cakeorderplatform.service_api.order.presentation.OrderResponse
import java.time.LocalDateTime
import java.util.*

@Service
class OrderService(
    private val orderRepository: OrderRepository,
    private val productRepository: ProductRepository,
    private val userRepository: UserRepository,
) {
    @Transactional
    fun createOrder(userId: Long, request: OrderCreateRequest): Long {
        val product = productRepository.findById(request.productId)
            .orElseThrow { IllegalArgumentException("Product not found") }

        val orderNumber = "ORD-${LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"))}-${UUID.randomUUID().toString().substring(0, 8)}"

        val order = OrderEntity(
            orderNumber = orderNumber,
            userId = userId,
            productId = request.productId,
            quantity = request.quantity,
            totalPrice = product.price * request.quantity,
            pickupDateTime = request.pickupDateTime,
            requirements = request.requirements,
            status = OrderStatus.PENDING
        )

        return orderRepository.save(order).id
    }

    @Transactional(readOnly = true)
    fun getMyOrders(userId: Long): List<OrderResponse> {
        val orders = orderRepository.findAllByUserId(userId)
        return orders.map { toResponse(it) }
    }

    @Transactional(readOnly = true)
    fun getAllOrders(): List<OrderResponse> {
        return orderRepository.findAll().map { toResponse(it) }
    }

    @Transactional
    fun updateOrderStatus(orderId: Long, status: OrderStatus): OrderResponse {
        val order = orderRepository.findById(orderId)
            .orElseThrow { IllegalArgumentException("Order not found") }
        order.status = status
        return toResponse(order)
    }

    private fun toResponse(entity: OrderEntity): OrderResponse {
        val product = productRepository.findById(entity.productId).orElse(null)
        val user = userRepository.findById(entity.userId).orElse(null)
        
        return OrderResponse.from(
            entity = entity,
            productName = product?.name ?: "Unknown Product",
            customerName = user?.nickname ?: "Unknown User"
        )
    }
}
