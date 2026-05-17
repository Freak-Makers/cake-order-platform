package yjh.ontongsal.cakeorderplatform.admin_api.post.presentation

data class AdminPostsResponse(
    val items: List<AdminPostResponse>,
    val total: Long,
    val offset: Int,
    val limit: Int,
)
