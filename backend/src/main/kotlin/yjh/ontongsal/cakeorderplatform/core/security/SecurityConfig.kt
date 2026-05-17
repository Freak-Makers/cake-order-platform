package yjh.ontongsal.cakeorderplatform.core.security

import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.encrypt.Encryptors
import org.springframework.security.crypto.encrypt.TextEncryptor
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import yjh.ontongsal.cakeorderplatform.core.security.advice.JwtAccessDeniedHandler
import yjh.ontongsal.cakeorderplatform.core.security.advice.JwtAuthenticationEntryPoint
import yjh.ontongsal.cakeorderplatform.core.security.crypto.CryptoProperties
import yjh.ontongsal.cakeorderplatform.core.security.filter.JwtSecurityContextFilter

@EnableConfigurationProperties(CryptoProperties::class)
@Configuration
class SecurityConfig(
    private val cryptoProperties: CryptoProperties,
    private val authenticationEntryPoint: JwtAuthenticationEntryPoint,
    private val accessDeniedHandler: JwtAccessDeniedHandler,
    private val jwtSecurityContextFilter: JwtSecurityContextFilter,
) {

    // 단방향 (비밀번호)
    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }

    // 양방향 (데이터 암호화)
    @Bean
    fun textEncryptor(): TextEncryptor {
        return Encryptors.text(cryptoProperties.password, cryptoProperties.salt)
    }

    @Bean
    fun userDetailsService(): UserDetailsService {
        return UserDetailsService { _ ->
            throw UsernameNotFoundException("JWT only authentication")
        }
    }

    @Profile("local", "test")
    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .headers { it.frameOptions { frame -> frame.sameOrigin() } }
            .formLogin { it.disable() }
            .httpBasic { it.disable() }
            .sessionManagement {
                it.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }
            .cors { }
            .authorizeHttpRequests {
                it
                    .requestMatchers("/h2-console/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/products").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/products/*/reviews").permitAll()
                    .requestMatchers("/api/v1/users/login/kakao/**").permitAll()
                    .requestMatchers("/api/v1/admin/users/login/**").permitAll()
                    .anyRequest().authenticated()
            }
            .addFilterBefore(jwtSecurityContextFilter, UsernamePasswordAuthenticationFilter::class.java)
            .exceptionHandling {
                it.authenticationEntryPoint(authenticationEntryPoint)
                it.accessDeniedHandler(accessDeniedHandler)
            }

        return http.build()
    }

    @Profile("local", "test")
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration().apply {
            allowedOrigins = listOf(
                "http://localhost:3000"
            )
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
            allowedHeaders = listOf("*")
            allowCredentials = true
        }

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)

        return source
    }
}
