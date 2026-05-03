package yjh.ontongsal.cakeorderplatform.service_api.user.presentation

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import yjh.ontongsal.cakeorderplatform.service_api.user.application.KakaoLoginService

@RestController
@RequestMapping("/api/v1/users")
class UserController(
    private val kakaoLoginService: KakaoLoginService,
) {
    @GetMapping("/login/kakao/url")
    fun getKakaoLoginUrl(): ResponseEntity<String> {
        val authorizationUrl = kakaoLoginService.getAuthorizeUrl()
        return ResponseEntity.ok(authorizationUrl)
    }

    @GetMapping("/login/kakao")
    fun login(@RequestParam code: String): ResponseEntity<UserResponse> {
        val user = kakaoLoginService.login(code)
        return ResponseEntity.ok(UserResponse.from(user))
    }
}
