package yjh.ontongsal.cakeorderplatform.core.client.kakao

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.client.RestClient
import org.springframework.web.client.body

@Component
class KakaoClient(
    @Value("\${kakao.client-id}")
    private val clientId: String,
    @Value("\${kakao.redirect-uri}")
    private val redirectUri: String,

    private val kakaoAuthClient: RestClient,
    private val kakaoApiClient: RestClient
) {
    fun getToken(code: String): KakaoTokenResponse {
        val params = LinkedMultiValueMap<String, String>().apply {
            add("grant_type", "authorization_code")
            add("client_id", clientId)
            add("redirect_uri", redirectUri)
            add("code", code)
        }

        return kakaoAuthClient.post()
            .uri("/oauth/token")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(params)
            .retrieve()
            .body<KakaoTokenResponse>() ?: throw RuntimeException("Failed to get token from Kakao")
    }

    fun getUserInfo(accessToken: String): KakaoUserInfoResponse {
        return kakaoApiClient.post()
            .uri("/v2/user/me")
            .header("Authorization", "Bearer $accessToken")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .retrieve()
            .body<KakaoUserInfoResponse>() ?: throw RuntimeException("Failed to get user info from Kakao")
    }
}
