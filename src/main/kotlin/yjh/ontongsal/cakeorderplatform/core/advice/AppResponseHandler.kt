package yjh.ontongsal.cakeorderplatform.core.advice

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.core.MethodParameter
import org.springframework.core.io.Resource
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.converter.HttpMessageConverter
import org.springframework.http.server.ServerHttpRequest
import org.springframework.http.server.ServerHttpResponse
import org.springframework.http.server.ServletServerHttpResponse
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice
import java.io.File
import java.io.InputStream

@RestControllerAdvice
class AppResponseHandler(
    private val objectMapper: ObjectMapper,
) : ResponseBodyAdvice<Any> {

    override fun supports(
        returnType: MethodParameter,
        converterType: Class<out HttpMessageConverter<*>?>,
    ): Boolean {
        return true
    }

    override fun beforeBodyWrite(
        body: Any?,
        returnType: MethodParameter,
        selectedContentType: MediaType,
        selectedConverterType: Class<out HttpMessageConverter<*>?>,
        request: ServerHttpRequest,
        response: ServerHttpResponse,
    ): Any? {
        // 1. 이미 응답 wrapper면 그대로
        if (body is SuccessResponse<*> || body is ErrorResponse) {
            return body
        }

        // 2. status 안전하게 추출
        val status = (response as? ServletServerHttpResponse)
            ?.servletResponse
            ?.status
            ?.let { HttpStatus.resolve(it) }
            ?: HttpStatus.OK

        // 3. 특수 타입 보호 (중요)
        if (
            body is ByteArray ||
            body is Resource ||
            body is InputStream ||
            body is File
        ) {
            return body
        }

        if (
            body == null ||
            body is String ||
            body is Number ||
            body is Boolean
        ) {
            return body
        }

        // 4. 성공 응답 wrapping
        return SuccessResponse(
            code = 200,
            message = status.reasonPhrase,
            data = body
        )
    }
}