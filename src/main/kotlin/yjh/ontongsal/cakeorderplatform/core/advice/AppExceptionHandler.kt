package yjh.ontongsal.cakeorderplatform.core.advice

import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.validation.ConstraintViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.context.request.WebRequest
import yjh.ontongsal.cakeorderplatform.core.exception.AppException

private val logger = KotlinLogging.logger {}

@RestControllerAdvice
class AppExceptionHandler {

    @ExceptionHandler(value = [AppException::class])
    fun handleAppException(e: AppException): ResponseEntity<ErrorResponse> {
        logger.error(e) { "AppException : ${e.message}" }

        val response = ErrorResponse(
            code = e.code,
            message = e.message ?: "Unknown error message",
            details = null
        )

        return ResponseEntity
            .status(
                HttpStatus.resolve(e.statusCode)
                    ?: HttpStatus.INTERNAL_SERVER_ERROR
            )
            .body(response)
    }

    // 2. @Valid (@RequestBody)
    @ExceptionHandler(value = [MethodArgumentNotValidException::class])
    fun handleValidationException(
        e: MethodArgumentNotValidException,
    ): ResponseEntity<ErrorResponse> {

        logger.error(e) { "Validation Exception" }

        val errors = e.bindingResult.fieldErrors.map {
            ErrorDetail(
                field = it.field,
                reason = it.defaultMessage ?: "invalid value"
            )
        }

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(
                ErrorResponse(
                    code = HttpStatus.BAD_REQUEST.value(),
                    message = HttpStatus.BAD_REQUEST.reasonPhrase,
                    details = errors
                )
            )
    }

    // 3. @RequestParam / PathVariable
    @ExceptionHandler(value = [ConstraintViolationException::class])
    fun handleConstraintViolationException(
        e: ConstraintViolationException,
    ): ResponseEntity<ErrorResponse> {

        logger.error(e) { "Constraint Violation" }

        val errors = e.constraintViolations.map {
            ErrorDetail(
                field = it.propertyPath.toString(),
                reason = it.message
            )
        }

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(
                ErrorResponse(
                    code = HttpStatus.BAD_REQUEST.value(),
                    message = HttpStatus.BAD_REQUEST.reasonPhrase,
                    details = errors.toList()
                )
            )
    }

    @ExceptionHandler(value = [MissingServletRequestParameterException::class])
    fun handleMissingParam(
        e: MissingServletRequestParameterException
    ): ResponseEntity<ErrorResponse> {

        logger.error(e) { "Missing Request Param" }

        val error = ErrorDetail(
            field = e.parameterName,
            reason = "required parameter is missing"
        )

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(
                ErrorResponse(
                    code = HttpStatus.BAD_REQUEST.value(),
                    message = HttpStatus.BAD_REQUEST.reasonPhrase,
                    details = listOf(error)
                )
            )
    }

    @ExceptionHandler(value = [Exception::class])
    fun handleException(e: Exception, request: WebRequest): ResponseEntity<ErrorResponse> {
        logger.error(e) { "Exception : ${e.message}" }

        val response = ErrorResponse(
            code = HttpStatus.INTERNAL_SERVER_ERROR.value(),
            message = HttpStatus.INTERNAL_SERVER_ERROR.reasonPhrase,
            details = listOf(
                ErrorDetail(
                    field = null,
                    reason = request.getDescription(false)
                )
            )
        )

        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(response)
    }
}