package yjh.ontongsal.cakeorderplatform.core.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.client.RestClient

@Configuration
class TossPaymentsConfig {

    @Bean
    fun tossPaymentsRestClient(builder: RestClient.Builder): RestClient {
        return builder.baseUrl("https://api.tosspayments.com").build()
    }
}
