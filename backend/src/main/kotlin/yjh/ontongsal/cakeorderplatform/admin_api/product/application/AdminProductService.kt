package yjh.ontongsal.cakeorderplatform.admin_api.product.application

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.admin_api.product.presentation.AdminProductCreateRequest
import yjh.ontongsal.cakeorderplatform.admin_api.product.presentation.AdminProductResponse
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ProductRepository

@Service
class AdminProductService(
    private val productRepository: ProductRepository,
) {
    @Transactional
    fun createProduct(request: AdminProductCreateRequest): AdminProductResponse {
        val product = ProductEntity(
            name = request.name,
            description = request.description,
            category = request.category,
            price = request.price,
            imageUrl = request.imageUrl,
        )
        val savedProduct = productRepository.save(product)
        return AdminProductResponse.from(savedProduct)
    }
}
