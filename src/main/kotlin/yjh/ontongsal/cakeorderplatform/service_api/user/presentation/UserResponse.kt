package yjh.ontongsal.cakeorderplatform.service_api.user.presentation

import yjh.ontongsal.cakeorderplatform.core.persistence.entity.User

data class UserResponse(
    val id: Long,
    val nickname: String,
    val email: String?,
    val profileImageUrl: String?
) {
    companion object {
        fun from(user: User) = UserResponse(
            id = user.id,
            nickname = user.nickname,
            email = user.email,
            profileImageUrl = user.profileImageUrl
        )
    }
}
