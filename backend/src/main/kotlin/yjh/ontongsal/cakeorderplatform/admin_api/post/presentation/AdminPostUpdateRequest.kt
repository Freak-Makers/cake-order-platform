package yjh.ontongsal.cakeorderplatform.admin_api.post.presentation

data class AdminPostUpdateRequest(
    val title: String? = null,
    val content: String? = null,
    val productId: Long? = null,
    val imageUrl: String? = null,
    val isNotice: Boolean? = null,
)
