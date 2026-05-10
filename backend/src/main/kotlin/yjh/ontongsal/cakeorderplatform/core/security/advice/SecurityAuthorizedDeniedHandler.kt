package yjh.ontongsal.cakeorderplatform.core.security.advice

import com.fasterxml.jackson.databind.ObjectMapper
import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.web.access.AccessDeniedHandler
import org.springframework.stereotype.Component
import yjh.ontongsal.cakeorderplatform.core.advice.ErrorResponse

private val log = KotlinLogging.logger {}

@Component
class JwtAccessDeniedHandler(
    private val objectMapper: ObjectMapper,
) : AccessDeniedHandler {

    override fun handle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        e: AccessDeniedException,
    ) {
        log.warn { "[ERROR] ${e.message}" }

        val responseBody = ErrorResponse(
            code = HttpStatus.FORBIDDEN.value(),
            message = e.message ?: "Unknown error message",
            details = listOf()
        )

        response.apply {
            contentType = "application/json"
            characterEncoding = "UTF-8"
            status = HttpStatus.FORBIDDEN.value()
            writer.write(objectMapper.writeValueAsString(responseBody))
        }
    }

}
