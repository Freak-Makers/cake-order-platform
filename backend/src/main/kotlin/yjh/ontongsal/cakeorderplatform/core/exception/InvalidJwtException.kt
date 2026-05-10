package yjh.ontongsal.cakeorderplatform.core.exception

class InvalidJwtException(
    message: String,
    cause: Throwable? = null
) : RuntimeException(message, cause)
