package yjh.ontongsal.cakeorderplatform.service_api.user.application

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import yjh.ontongsal.cakeorderplatform.core.client.kakao.KakaoClient
import yjh.ontongsal.cakeorderplatform.core.security.jwt.JwtTokenProvider
import yjh.ontongsal.cakeorderplatform.service_api.user.presentation.OauthUrlResponse
import yjh.ontongsal.cakeorderplatform.service_api.user.presentation.UserResponse
import java.time.Duration
import java.util.*

@Service
class KakaoLoginService(
    @Value("\${kakao.client-id}")
    private val clientId: String,
    @Value("\${kakao.redirect-uri}")
    private val redirectUri: String,

    private val kakaoClient: KakaoClient,
    private val userAppender: UserAppender,
    private val jwtTokenProvider: JwtTokenProvider,
) {
    fun getAuthorizeUrl(): OauthUrlResponse {
        val state = UUID.randomUUID().toString()

        val authorizationUrl =
            "https://kauth.kakao.com/oauth/authorize?client_id=$clientId&redirect_uri=$redirectUri&response_type=code&state=$state"
        return OauthUrlResponse(authorizationUrl)
    }

    fun login(code: String): UserResponse {
        // 1. 외부 API 호출 (Transaction 외부)
        val tokenResponse = kakaoClient.getToken(code)
        // ex. KakaoTokenResponse(tokenType=bearer, accessToken=0vPRd-kisjnPcIO2wf6r69kIvVWy2zRFAAAAAQoXNVcAAAGeE66I6UPPWzORmYVE, refreshToken=K3h8gRmhVvuJtiN4GZ3nYYYVDhZlJKjZAAAAAgoXNVcAAAGeE66I5UPPWzORmYVE, expiresIn=21599, scope=null, refreshTokenExpiresIn=5183999)

        val userInfo = kakaoClient.getUserInfo(tokenResponse.accessToken)
        // ex. KakaoUserInfoResponse(id=4889192588, connectedAt=2026-05-10T15:39:06Z, properties=null, kakaoAccount=null)

        // 2. DB 작업 (별도 컴포넌트 호출로 Transaction 보장)
        val user = userAppender.saveOrUpdateUser(userInfo)
        val accessToken = jwtTokenProvider.generateSocialToken(
            userId = user.id,
            socialId = user.socialId,
            socialProvider = user.provider.name,
            expiredAt = Duration.ofHours(24)
        )

        return UserResponse.from(user, accessToken)
    }
}
