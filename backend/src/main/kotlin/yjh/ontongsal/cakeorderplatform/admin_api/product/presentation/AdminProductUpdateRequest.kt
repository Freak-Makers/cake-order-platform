package yjh.ontongsal.cakeorderplatform.admin_api.product.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductStatus

data class AdminProductUpdateRequest(
    val name: String? = null,
    val description: String? = null,
    val category: String? = null,
    val price: Long? = null,
    val imageUrl: String? = null,
    val status: ProductStatus? = null,
)
