package yjh.ontongsal.cakeorderplatform.admin_api.chat.presentation

data class AdminChatRoomsResponse(
    val items: List<AdminChatRoomResponse>,
    val total: Long,
    val offset: Int,
    val limit: Int,
)
