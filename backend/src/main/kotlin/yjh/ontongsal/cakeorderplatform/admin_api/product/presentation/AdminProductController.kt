package yjh.ontongsal.cakeorderplatform.admin_api.product.presentation

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import yjh.ontongsal.cakeorderplatform.admin_api.product.application.AdminProductService

@RestController
@RequestMapping("/api/v1/admin/products")
class AdminProductController(
    private val adminProductService: AdminProductService,
) {
    @GetMapping
    fun getProducts(
        @RequestParam(defaultValue = "0") offset: Int,
        @RequestParam(defaultValue = "20") limit: Int,
    ): ResponseEntity<AdminProductsResponse> {
        return ResponseEntity.ok(adminProductService.getProducts(offset, limit))
    }

    @PostMapping
    fun createProduct(@RequestBody request: AdminProductCreateRequest): ResponseEntity<AdminProductResponse> {
        return ResponseEntity.ok(adminProductService.createProduct(request))
    }

    @PutMapping("/{id}")
    fun updateProduct(
        @PathVariable id: Long,
        @RequestBody request: AdminProductUpdateRequest,
    ): ResponseEntity<AdminProductResponse> {
        return ResponseEntity.ok(adminProductService.updateProduct(id, request))
    }

    @DeleteMapping("/{id}")
    fun deleteProduct(@PathVariable id: Long): ResponseEntity<Unit> {
        adminProductService.deleteProduct(id)
        return ResponseEntity.ok().build()
    }
}
