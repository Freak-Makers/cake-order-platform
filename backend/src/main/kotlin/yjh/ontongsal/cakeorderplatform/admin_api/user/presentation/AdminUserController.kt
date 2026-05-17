package yjh.ontongsal.cakeorderplatform.admin_api.user.presentation

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import yjh.ontongsal.cakeorderplatform.admin_api.user.application.AdminLoginService

@RestController
@RequestMapping("/api/v1/admin/users")
class AdminUserController(
    private val adminLoginService: AdminLoginService,
) {

    @PostMapping("/login")
    fun login(@RequestBody request: AdminLoginRequest): ResponseEntity<AdminLoginResponse> {
        val response = adminLoginService.login(request.email, request.password)
        return ResponseEntity.ok(response)
    }
}