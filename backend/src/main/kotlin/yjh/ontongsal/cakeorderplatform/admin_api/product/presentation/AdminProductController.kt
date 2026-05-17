package yjh.ontongsal.cakeorderplatform.admin_api.product.presentation

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import yjh.ontongsal.cakeorderplatform.admin_api.product.application.AdminProductService

@RestController
@RequestMapping("/api/v1/admin/products")
class AdminProductController(
    private val adminProductService: AdminProductService,
) {
    @PostMapping
    fun createProduct(@RequestBody request: AdminProductCreateRequest): ResponseEntity<AdminProductResponse> {
        return ResponseEntity.ok(adminProductService.createProduct(request))
    }
}
