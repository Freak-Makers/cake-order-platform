package yjh.ontongsal.cakeorderplatform.core.client.toss

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

data class TossConfirmRequest(
    val paymentKey: String,
    val orderId: String,
    val amount: Long,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class TossPaymentResponse(
    @JsonProperty("paymentKey")
    val paymentKey: String,
    @JsonProperty("orderId")
    val orderId: String,
    @JsonProperty("orderName")
    val orderName: String?,
    @JsonProperty("status")
    val status: String,
    @JsonProperty("totalAmount")
    val totalAmount: Long,
    @JsonProperty("method")
    val method: String?,
    @JsonProperty("approvedAt")
    val approvedAt: String?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class TossErrorResponse(
    val code: String,
    val message: String,
)
