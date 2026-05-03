package yjh.ontongsal.cakeorderplatform.core.advice

import java.time.Instant

interface ApiResponse {
    val code: Int
    val message: String
}

data class SuccessResponse<T>(
    override val code: Int = 200,
    override val message: String,
    val data: T?,
) : ApiResponse

data class ErrorResponse(
    override val code: Int,
    override val message: String,
    val errors: List<ErrorDetail>? = null,
    val timestamp: Instant = Instant.now(),
) : ApiResponse

data class ErrorDetail(
    val field: String?,
    val reason: String,
)
