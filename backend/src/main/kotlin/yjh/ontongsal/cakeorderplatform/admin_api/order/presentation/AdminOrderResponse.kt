package yjh.ontongsal.cakeorderplatform.admin_api.order.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.OrderEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.OrderStatus
import java.time.LocalDateTime

data class AdminOrderResponse(
    val id: Long,
    val orderNumber: String,
    val productId: Long,
    val productName: String,
    val customerName: String,
    val quantity: Int,
    val totalPrice: Long,
    val pickupDateTime: LocalDateTime,
    val requirements: String?,
    val status: OrderStatus,
    val createdAt: LocalDateTime,
) {
    companion object {
        fun from(entity: OrderEntity, productName: String, customerName: String) = AdminOrderResponse(
            id = entity.id,
            orderNumber = entity.orderNumber,
            productId = entity.productId,
            productName = productName,
            customerName = customerName,
            quantity = entity.quantity,
            totalPrice = entity.totalPrice,
            pickupDateTime = entity.pickupDateTime,
            requirements = entity.requirements,
            status = entity.status,
            createdAt = entity.createdAt,
        )
    }
}
