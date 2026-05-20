package yjh.ontongsal.cakeorderplatform.service_api.post.presentation

data class CommentsResponse(
    val items: List<CommentResponse>,
    val total: Long,
    val offset: Int,
    val limit: Int,
)
