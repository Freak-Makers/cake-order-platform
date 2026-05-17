package yjh.ontongsal.cakeorderplatform.admin_api.product.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductStatus
import java.time.LocalDateTime

data class AdminProductResponse(
    val id: Long,
    val name: String,
    val description: String,
    val category: String,
    val price: Long,
    val imageUrl: String,
    val status: ProductStatus,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
) {
    companion object {
        fun from(entity: ProductEntity) = AdminProductResponse(
            id = entity.id,
            name = entity.name,
            description = entity.description,
            category = entity.category,
            price = entity.price,
            imageUrl = entity.imageUrl,
            status = entity.status,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
        )
    }
}
