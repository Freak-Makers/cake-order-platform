package yjh.ontongsal.cakeorderplatform.admin_api.user.presentation

data class AdminLoginResponse(
    val id: Long,
    val nickname: String,
    val email: String?,
    val accessToken: String,
)