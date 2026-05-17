package yjh.ontongsal.cakeorderplatform.service_api.user.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.UserEntity

data class UserResponse(
    val id: Long,
    val nickname: String,
    val email: String?,
    val profileImageUrl: String?,
    val accessToken: String,
) {
    companion object {
        fun from(user: UserEntity, accessToken: String) = UserResponse(
            id = user.id,
            nickname = user.nickname,
            email = user.email,
            profileImageUrl = user.profileImageUrl,
            accessToken = accessToken
        )
    }
}
