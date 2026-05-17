package yjh.ontongsal.cakeorderplatform.service_api.user.application

import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.core.client.kakao.KakaoUserInfoResponse
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.SocialProvider
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.UserEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.UserRepository
import kotlin.random.Random

@Component
class UserAppender(
    private val userRepository: UserRepository
) {
    @Transactional
    fun saveOrUpdateUser(userInfo: KakaoUserInfoResponse): UserEntity {
        val socialId = userInfo.id.toString()

        val user = UserEntity(
            socialId = socialId,
            nickname = "닉네임${Random.nextInt(1000, 9999)}",
            provider = SocialProvider.KAKAO
        )
        return userRepository.findBySocialId(socialId)
            ?: userRepository.save(user)
    }
}
