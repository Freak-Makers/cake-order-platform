package yjh.ontongsal.cakeorderplatform.admin_api.product.presentation

data class AdminProductCreateRequest(
    val name: String,
    val description: String,
    val category: String,
    val price: Long,
    val imageUrl: String,
)
