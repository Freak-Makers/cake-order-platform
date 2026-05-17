package yjh.ontongsal.cakeorderplatform.service_api.post.presentation

data class PostsResponse(
    val items: List<PostResponse>,
    val total: Long,
    val offset: Int,
    val limit: Int,
)
