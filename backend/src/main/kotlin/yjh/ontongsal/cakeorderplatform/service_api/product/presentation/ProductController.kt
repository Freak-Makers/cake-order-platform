package yjh.ontongsal.cakeorderplatform.service_api.product.presentation

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import yjh.ontongsal.cakeorderplatform.service_api.product.application.ProductService
import yjh.ontongsal.cakeorderplatform.service_api.product.application.ProductSort

@RestController
@RequestMapping("/api/v1/products")
class ProductController(
    private val productService: ProductService,
) {
    @GetMapping
    fun getProducts(
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
            ),
        )
    }

    @GetMapping("/categories")
    fun getCategories(): ResponseEntity<List<String>> {
        return ResponseEntity.ok(productService.getCategories())
    }
}
