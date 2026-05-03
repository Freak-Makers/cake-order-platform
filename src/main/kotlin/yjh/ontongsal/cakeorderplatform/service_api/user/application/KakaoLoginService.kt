package yjh.ontongsal.cakeorderplatform.service_api.user.application

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import yjh.ontongsal.cakeorderplatform.core.client.kakao.KakaoClient
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.User
import java.util.*

@Service
class KakaoLoginService(
    @Value("\${kakao.client-id}")
    private val clientId: String,
    @Value("\${kakao.redirect-uri}")
    private val redirectUri: String,

    private val kakaoClient: KakaoClient,
    private val userAppender: UserAppender
) {
    fun getAuthorizeUrl(): String {
        val state = UUID.randomUUID().toString()
        return "https://kauth.kakao.com/oauth/authorize?client_id=$clientId&redirect_uri=$redirectUri&response_type=code&state=$state"
    }

    fun login(code: String): User {
        // 1. 외부 API 호출 (Transaction 외부)
        val tokenResponse = kakaoClient.getToken(code)
        val userInfo = kakaoClient.getUserInfo(tokenResponse.accessToken)

        // 2. DB 작업 (별도 컴포넌트 호출로 Transaction 보장)
        return userAppender.saveOrUpdateUser(userInfo)
    }
}
