package yjh.ontongsal.cakeorderplatform.service_api.chat.presentation

data class ChatMessagesResponse(
    val items: List<ChatMessageResponse>,
    val total: Long,
    val offset: Int,
    val limit: Int,
)
