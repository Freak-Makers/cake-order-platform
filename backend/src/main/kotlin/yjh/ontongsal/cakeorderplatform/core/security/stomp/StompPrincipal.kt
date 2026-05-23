package yjh.ontongsal.cakeorderplatform.core.security.stomp

import org.springframework.security.core.Authentication
import java.security.Principal

/**
 * STOMP user destination 라우팅(`/user/{name}/queue/...`) 이 userId 기반으로 동작하도록
 * name 을 userId.toString() 으로 고정한 Principal.
 *
 * TestingUserDetails.getUsername() 은 email 이라 convertAndSendToUser 라우팅 키로 부적합.
 */
class StompPrincipal(
    private val userId: Long,
    val role: String?,
    val authentication: Authentication,
) : Principal {

    val userIdValue: Long get() = userId

    override fun getName(): String = userId.toString()
}
