package yjh.ontongsal.cakeorderplatform.admin_api.user.application

import org.springframework.stereotype.Service
import yjh.ontongsal.cakeorderplatform.admin_api.user.presentation.AdminLoginResponse
import yjh.ontongsal.cakeorderplatform.core.security.jwt.JwtTokenProvider
import java.time.Duration

@Service
class AdminLoginService(
    private val jwtTokenProvider: JwtTokenProvider,
) {
    fun login(email: String, password: String): AdminLoginResponse {
        val accessToken = jwtTokenProvider.generateToken(
            userId = 999,
            email = email,
            role = "ADMIN",
            expiredAt = Duration.ofHours(24)
        )

        return AdminLoginResponse(
            id = 9999,
            nickname = "홍길동(관리자)",
            email = email,
            accessToken = accessToken,
        )
    }
}