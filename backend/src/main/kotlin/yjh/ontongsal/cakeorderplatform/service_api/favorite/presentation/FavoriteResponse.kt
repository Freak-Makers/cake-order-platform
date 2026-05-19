package yjh.ontongsal.cakeorderplatform.service_api.favorite.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.FavoriteEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductStatus
import java.time.LocalDateTime

data class FavoriteResponse(
    val id: Long,
    val productId: Long,
    val productName: String,
    val productPrice: Long,
    val productImageUrl: String,
    val productStatus: ProductStatus,
    val createdAt: LocalDateTime,
) {
    companion object {
        fun from(entity: FavoriteEntity, product: ProductEntity) = FavoriteResponse(
            id = entity.id,
            productId = product.id,
            productName = product.name,
            productPrice = product.price,
            productImageUrl = product.imageUrl,
            productStatus = product.status,
            createdAt = entity.createdAt,
        )
    }
}
