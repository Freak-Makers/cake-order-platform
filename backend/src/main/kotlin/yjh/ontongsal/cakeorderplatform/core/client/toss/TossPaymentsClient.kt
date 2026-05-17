package yjh.ontongsal.cakeorderplatform.core.client.toss

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import org.springframework.web.client.RestClientResponseException
import org.springframework.web.client.body
import yjh.ontongsal.cakeorderplatform.core.exception.AppException
import yjh.ontongsal.cakeorderplatform.core.exception.ErrorCode
import java.util.Base64

private val log = KotlinLogging.logger {}

@Component
class TossPaymentsClient(
    @Value("\${toss.secret-key}")
    private val secretKey: String,

    private val tossPaymentsRestClient: RestClient,
) {
    fun confirmPayment(paymentKey: String, orderId: String, amount: Long): TossPaymentResponse {
        val basicAuth = Base64.getEncoder().encodeToString("$secretKey:".toByteArray())

        return try {
            tossPaymentsRestClient.post()
                .uri("/v1/payments/confirm")
                .header("Authorization", "Basic $basicAuth")
                .contentType(MediaType.APPLICATION_JSON)
                .body(TossConfirmRequest(paymentKey, orderId, amount))
                .retrieve()
                .body<TossPaymentResponse>()
                ?: throw AppException.Internal(ErrorCode.PAYMENT_VERIFICATION_FAILED, "토스 응답이 비어있습니다")
        } catch (e: RestClientResponseException) {
            log.warn { "Toss confirm failed: status=${e.statusCode}, body=${e.responseBodyAsString}" }
            throw AppException.BadRequest(
                ErrorCode.PAYMENT_VERIFICATION_FAILED,
                "토스 결제 승인 실패: ${e.statusCode}"
            )
        }
    }
}
