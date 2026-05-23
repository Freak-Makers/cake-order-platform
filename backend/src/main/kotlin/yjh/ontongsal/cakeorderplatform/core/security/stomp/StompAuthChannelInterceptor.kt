package yjh.ontongsal.cakeorderplatform.core.security.stomp

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.MessageDeliveryException
import org.springframework.messaging.simp.stomp.StompCommand
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.support.ChannelInterceptor
import org.springframework.stereotype.Component
import yjh.ontongsal.cakeorderplatform.core.exception.InvalidJwtException
import yjh.ontongsal.cakeorderplatform.core.security.TestingUserDetails
import yjh.ontongsal.cakeorderplatform.core.security.jwt.JwtTokenProvider

private val log = KotlinLogging.logger {}

/**
 * STOMP CONNECT 프레임의 Authorization 헤더에서 JWT 를 검증하고
 * 인증된 사용자를 SimpMessageHeaderAccessor 의 user 로 세팅한다.
 *
 * 이후 모든 STOMP 프레임은 이 user 정보를 통해 인가 및 user destination 라우팅에 사용된다.
 */
@Component
class StompAuthChannelInterceptor(
    private val jwtTokenProvider: JwtTokenProvider,
) : ChannelInterceptor {

    override fun preSend(message: Message<*>, channel: MessageChannel): Message<*> {
        val accessor = StompHeaderAccessor.wrap(message)

        when (accessor.command) {
            StompCommand.CONNECT -> authenticate(accessor)
            StompCommand.SEND,
            StompCommand.SUBSCRIBE,
            StompCommand.UNSUBSCRIBE -> requireAuthenticated(accessor)
            else -> Unit
        }

        return message
    }

    private fun authenticate(accessor: StompHeaderAccessor) {
        val token = accessor.getFirstNativeHeader("Authorization")
            ?.takeIf { it.startsWith("Bearer ") }
            ?.substring(7)
            ?: throw MessageDeliveryException("Authorization 헤더가 없습니다")

        try {
            val authentication = jwtTokenProvider.getAuthentication(token)
            val userDetails = authentication.principal as TestingUserDetails
            val role = authentication.authorities
                .firstOrNull { it.authority.startsWith("ROLE_") }
                ?.authority
                ?.removePrefix("ROLE_")

            accessor.user = StompPrincipal(
                userId = userDetails.userId,
                role = role,
                authentication = authentication,
            )
        } catch (e: InvalidJwtException) {
            log.debug(e) { "STOMP CONNECT JWT 검증 실패" }
            throw MessageDeliveryException("STOMP 인증 실패")
        } catch (e: Exception) {
            log.debug(e) { "STOMP CONNECT 인증 처리 에러" }
            throw MessageDeliveryException("STOMP 인증 실패")
        }
    }

    private fun requireAuthenticated(accessor: StompHeaderAccessor) {
        if (accessor.user !is StompPrincipal) {
            throw MessageDeliveryException("인증되지 않은 STOMP 요청")
        }
    }
}
