package yjh.ontongsal.cakeorderplatform.admin_api.product.presentation

data class AdminProductsResponse(
    val items: List<AdminProductResponse>,
    val total: Long,
    val offset: Int,
    val limit: Int,
)
