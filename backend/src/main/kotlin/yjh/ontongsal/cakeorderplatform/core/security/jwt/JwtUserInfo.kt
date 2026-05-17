package yjh.ontongsal.cakeorderplatform.core.security.jwt

data class JwtUserInfo(
    val userId: Long,
    val email: String?,
    val role: String?,
)
