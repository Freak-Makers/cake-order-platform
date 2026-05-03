package yjh.ontongsal.cakeorderplatform.core.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.client.RestClient

@Configuration
class KakaoConfig {

    @Bean
    fun kakaoAuthClient(builder: RestClient.Builder): RestClient {
        return builder.baseUrl("https://kauth.kakao.com").build()
    }

    @Bean
    fun kakaoApiClient(builder: RestClient.Builder): RestClient {
        return builder.baseUrl("https://kapi.kakao.com").build()
    }
}
