package yjh.ontongsal.cakeorderplatform.admin_api.post.presentation

data class AdminPostCreateRequest(
    val title: String,
    val content: String,
    val productId: Long? = null,
    val imageUrl: String? = null,
    val isNotice: Boolean = false,
)
