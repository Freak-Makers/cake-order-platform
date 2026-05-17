package yjh.ontongsal.cakeorderplatform.admin_api.order.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.OrderStatus

data class OrderStatusUpdateRequest(
    val status: OrderStatus,
)
