package yjh.ontongsal.cakeorderplatform.admin_api.product.presentation

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import yjh.ontongsal.cakeorderplatform.service_api.product.application.ProductService
import yjh.ontongsal.cakeorderplatform.service_api.product.presentation.ProductResponse

@RestController
@RequestMapping("/api/v1/admin/products")
class AdminProductController(
    private val productService: ProductService,
) {
    @PostMapping
    fun createProduct(@RequestBody request: ProductCreateRequest): ResponseEntity<ProductResponse> {
        return ResponseEntity.ok(productService.createProduct(request))
    }
}
