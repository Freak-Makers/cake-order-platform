package yjh.ontongsal.cakeorderplatform.admin_api.product.application

import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.admin_api.product.presentation.AdminProductCreateRequest
import yjh.ontongsal.cakeorderplatform.admin_api.product.presentation.AdminProductResponse
import yjh.ontongsal.cakeorderplatform.admin_api.product.presentation.AdminProductUpdateRequest
import yjh.ontongsal.cakeorderplatform.admin_api.product.presentation.AdminProductsResponse
import yjh.ontongsal.cakeorderplatform.core.exception.AppException
import yjh.ontongsal.cakeorderplatform.core.exception.ErrorCode
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ProductRepository

@Service
class AdminProductService(
    private val productRepository: ProductRepository,
) {
    @Transactional(readOnly = true)
    fun getProducts(offset: Int, limit: Int): AdminProductsResponse {
        val safeLimit = limit.coerceIn(1, 100)
        val safeOffset = offset.coerceAtLeast(0)
        val pageIdx = safeOffset / safeLimit
        val page = productRepository.findAll(
            PageRequest.of(pageIdx, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt"))
        )
        return AdminProductsResponse(
            items = page.content.map { AdminProductResponse.from(it) },
            total = page.totalElements,
            offset = pageIdx * safeLimit,
            limit = safeLimit,
        )
    }

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

    @Transactional
    fun updateProduct(id: Long, request: AdminProductUpdateRequest): AdminProductResponse {
        val product = productRepository.findById(id)
            .orElseThrow { AppException.NotFound(ErrorCode.PRODUCT_NOT_FOUND) }

        request.name?.let { product.name = it }
        request.description?.let { product.description = it }
        request.category?.let { product.category = it }
        request.price?.let { product.price = it }
        request.imageUrl?.let { product.imageUrl = it }
        request.status?.let { product.status = it }

        return AdminProductResponse.from(product)
    }

    @Transactional
    fun deleteProduct(id: Long) {
        if (!productRepository.existsById(id)) {
            throw AppException.NotFound(ErrorCode.PRODUCT_NOT_FOUND)
        }
        productRepository.deleteById(id)
    }
}
