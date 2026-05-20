package yjh.ontongsal.cakeorderplatform.service_api.product.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductStatus
import java.time.LocalDateTime

data class ProductResponse(
    val id: Long,
    val name: String,
    val description: String,
    val category: String,
    val price: Long,
    val imageUrl: String,
    val status: ProductStatus,
    val likeCount: Long,
    val isLiked: Boolean,
    val isFavorited: Boolean,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
) {
    companion object {
        fun from(entity: ProductEntity, isLiked: Boolean = false, isFavorited: Boolean = false) = ProductResponse(
            id = entity.id,
            name = entity.name,
            description = entity.description,
            category = entity.category,
            price = entity.price,
            imageUrl = entity.imageUrl,
            status = entity.status,
            likeCount = entity.likeCount,
            isLiked = isLiked,
            isFavorited = isFavorited,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
        )
    }
}
