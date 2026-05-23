package yjh.ontongsal.cakeorderplatform.admin_api.chat.presentation

data class AdminChatMessagesResponse(
    val items: List<AdminChatMessageResponse>,
    val total: Long,
    val offset: Int,
    val limit: Int,
)
