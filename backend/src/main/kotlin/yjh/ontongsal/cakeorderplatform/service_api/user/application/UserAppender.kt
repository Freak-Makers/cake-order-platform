package yjh.ontongsal.cakeorderplatform.service_api.user.application

import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.core.client.kakao.KakaoUserInfoResponse
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.SocialProvider
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.User
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.UserRepository

@Component
class UserAppender(
    private val userRepository: UserRepository
) {
    @Transactional
    fun saveOrUpdateUser(userInfo: KakaoUserInfoResponse): User {
        val socialId = userInfo.id.toString()
        val nickname = userInfo.kakaoAccount?.profile?.nickname ?: userInfo.properties?.nickname ?: "Unknown"
        val email = userInfo.kakaoAccount?.email
        val profileImageUrl = userInfo.kakaoAccount?.profile?.profileImageUrl ?: userInfo.properties?.profileImage

        val user = userRepository.findBySocialId(socialId)
            ?: User(
                socialId = socialId,
                nickname = nickname,
                email = email,
                profileImageUrl = profileImageUrl,
                provider = SocialProvider.KAKAO
            ).let { userRepository.save(it) }

        user.nickname = nickname
        user.email = email
        user.profileImageUrl = profileImageUrl

        return user
    }
}
