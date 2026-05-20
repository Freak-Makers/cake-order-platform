package yjh.ontongsal.cakeorderplatform.core.security.jwt

import io.jsonwebtoken.Claims
import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.stereotype.Component
import yjh.ontongsal.cakeorderplatform.core.exception.InvalidJwtException
import yjh.ontongsal.cakeorderplatform.core.security.TestingUserDetails
import java.time.Duration
import java.util.*

@EnableConfigurationProperties(JwtProperties::class)
@Component
class JwtTokenProvider(
    private val jwtProperties: JwtProperties,
) {

    fun generateSocialToken(userId: Long, socialId: String, socialProvider: String, expiredAt: Duration): String {
        val now = Date()
        val exp = Date(now.time + expiredAt.toMillis())
        val secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtProperties.secretKey))

        return Jwts.builder()
            .subject(userId.toString())
            .issuer(jwtProperties.issuer)
            .issuedAt(now)
            .expiration(exp)
            .signWith(secretKey)
            .claims(
                mapOf(
                    "socialId" to socialId,
                    "socialProvider" to socialProvider
                )
            )
            .compact()
    }

    fun generateToken(userId: Long, email: String, role: String, expiredAt: Duration): String {
        val now = Date()
        val exp = Date(now.time + expiredAt.toMillis())
        val secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtProperties.secretKey))

        return Jwts.builder()
            .subject(userId.toString())
            .issuer(jwtProperties.issuer)
            .issuedAt(now)
            .expiration(exp)
            .signWith(secretKey)
            .claims(
                mapOf(
                    "email" to email,
                    "role" to role
                )
            )
            .compact()
    }

    fun getAuthentication(token: String): Authentication {
        val jwtUserInfo: JwtUserInfo = getUserInfo(token)

        // role 클레임이 있으면 Spring 의 hasRole() 매처가 인식하도록 ROLE_ 접두사를 붙여 GrantedAuthority 로 변환
        val authorities = jwtUserInfo.role
            ?.takeIf { it.isNotBlank() }
            ?.let { listOf(SimpleGrantedAuthority("ROLE_$it")) }
            ?: emptyList()

        val userDetails = TestingUserDetails(
            userId = jwtUserInfo.userId,
            email = jwtUserInfo.email ?: "",
            password = "",
            authorities = authorities,
        )

        return UsernamePasswordAuthenticationToken(
            userDetails,
            token,
            userDetails.authorities
        )
    }

    private fun getUserInfo(token: String): JwtUserInfo {
        val claims = getClaims(token)

        val userId = getClaims(token).subject.toLong()
        val email = claims.get("email", String::class.java)
        val role = claims.get("role", String::class.java)

        return JwtUserInfo(
            userId = userId,
            email = email,
            role = role,
        )
    }

    private fun getClaims(token: String): Claims {
        val secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtProperties.secretKey))

        return try {
            Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .payload
        } catch (e: JwtException) {
            throw InvalidJwtException("유효하지 않은 JWT 토큰", e)
        } catch (e: Exception) {
            throw InvalidJwtException("JWT 토큰 파싱 에러", e)
        }
    }
}
