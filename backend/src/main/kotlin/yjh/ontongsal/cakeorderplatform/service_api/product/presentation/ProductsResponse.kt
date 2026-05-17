package yjh.ontongsal.cakeorderplatform.service_api.product.presentation

data class ProductsResponse(
    val items: List<ProductResponse>,
    val nextCursor: String?,
    val hasNext: Boolean,
)
