package yjh.ontongsal.cakeorderplatform.service_api.product.presentation

import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import yjh.ontongsal.cakeorderplatform.core.security.TestingUserDetails
import yjh.ontongsal.cakeorderplatform.service_api.product.application.ProductService
import yjh.ontongsal.cakeorderplatform.service_api.product.application.ProductSort

@RestController
@RequestMapping("/api/v1/products")
class ProductController(
    private val productService: ProductService,
) {
    @GetMapping
    fun getProducts(
        @AuthenticationPrincipal userDetails: TestingUserDetails?,
        @RequestParam(required = false) cursor: String?,
        @RequestParam(defaultValue = "20") limit: Int,
        @RequestParam(required = false) category: String?,
        @RequestParam(defaultValue = "latest") sort: String,
    ): ResponseEntity<ProductsResponse> {
        return ResponseEntity.ok(
            productService.getProducts(
                cursor = cursor,
                limit = limit,
                category = category,
                sort = ProductSort.fromQuery(sort),
                currentUserId = userDetails?.userId,
            ),
        )
    }

    @GetMapping("/categories")
    fun getCategories(): ResponseEntity<List<String>> {
        return ResponseEntity.ok(productService.getCategories())
    }

    @GetMapping("/{id}")
    fun getProduct(
        @AuthenticationPrincipal userDetails: TestingUserDetails?,
        @PathVariable id: Long,
    ): ResponseEntity<ProductResponse> {
        return ResponseEntity.ok(productService.getProduct(id, userDetails?.userId))
    }

    @PostMapping("/{id}/like")
    fun toggleLike(
        @AuthenticationPrincipal userDetails: TestingUserDetails,
        @PathVariable id: Long,
    ): ResponseEntity<Unit> {
        productService.toggleLike(id, userDetails.userId)
        return ResponseEntity.ok().build()
    }
}
