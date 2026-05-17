package yjh.ontongsal.cakeorderplatform.service_api.product.application

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.admin_api.product.presentation.ProductCreateRequest
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ProductRepository
import yjh.ontongsal.cakeorderplatform.service_api.product.presentation.ProductResponse

@Service
class ProductService(
    private val productRepository: ProductRepository,
) {
    @Transactional(readOnly = true)
    fun getAllProducts(): List<ProductResponse> {
        return productRepository.findAll().map { ProductResponse.from(it) }
    }

    @Transactional
    fun createProduct(request: ProductCreateRequest): ProductResponse {
        val product = ProductEntity(
            name = request.name,
            description = request.description,
            category = request.category,
            price = request.price,
            imageUrl = request.imageUrl,
        )
        val savedProduct = productRepository.save(product)
        return ProductResponse.from(savedProduct)
    }
}
