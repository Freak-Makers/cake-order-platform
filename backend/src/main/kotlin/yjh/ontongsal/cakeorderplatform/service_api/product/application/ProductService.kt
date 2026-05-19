package yjh.ontongsal.cakeorderplatform.service_api.product.application

import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.core.exception.AppException
import yjh.ontongsal.cakeorderplatform.core.exception.ErrorCode
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductLikeEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.FavoriteRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ProductLikeRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ProductRepository
import yjh.ontongsal.cakeorderplatform.service_api.product.presentation.ProductResponse
import yjh.ontongsal.cakeorderplatform.service_api.product.presentation.ProductsResponse
import java.time.LocalDateTime

@Service
class ProductService(
    private val productRepository: ProductRepository,
    private val productLikeRepository: ProductLikeRepository,
    private val favoriteRepository: FavoriteRepository,
) {
    @Transactional(readOnly = true)
    fun getProducts(
        cursor: String?,
        limit: Int,
        category: String?,
        sort: ProductSort,
        currentUserId: Long?,
    ): ProductsResponse {
        val safeLimit = limit.coerceIn(1, 50)
        val normalizedCategory = category?.takeIf { it.isNotBlank() }
        val decoded = cursor?.let { ProductCursor.decode(it) }
        if (decoded != null && decoded.sort != sort) {
            throw AppException.BadRequest(ErrorCode.PRODUCT_INVALID_CURSOR)
        }

        val pageable = PageRequest.of(0, safeLimit + 1)
        val fetched: List<ProductEntity> = when (sort) {
            ProductSort.LATEST -> productRepository.findLatestPage(
                category = normalizedCategory,
                lastCreatedAt = decoded?.lastValue?.let { LocalDateTime.parse(it) },
                lastId = decoded?.lastId,
                pageable = pageable,
            )
            ProductSort.PRICE_ASC -> productRepository.findPriceAscPage(
                category = normalizedCategory,
                lastPrice = decoded?.lastValue?.toLongOrNull(),
                lastId = decoded?.lastId,
                pageable = pageable,
            )
            ProductSort.PRICE_DESC -> productRepository.findPriceDescPage(
                category = normalizedCategory,
                lastPrice = decoded?.lastValue?.toLongOrNull(),
                lastId = decoded?.lastId,
                pageable = pageable,
            )
        }

        val hasNext = fetched.size > safeLimit
        val items = if (hasNext) fetched.take(safeLimit) else fetched
        val nextCursor = if (hasNext) {
            val last = items.last()
            val lastValue = when (sort) {
                ProductSort.LATEST -> last.createdAt.toString()
                ProductSort.PRICE_ASC, ProductSort.PRICE_DESC -> last.price.toString()
            }
            ProductCursor.encode(ProductCursor(sort, lastValue, last.id))
        } else {
            null
        }

        return ProductsResponse(
            items = items.map {
                ProductResponse.from(
                    it,
                    isLiked = isLikedBy(currentUserId, it.id),
                    isFavorited = isFavoritedBy(currentUserId, it.id),
                )
            },
            nextCursor = nextCursor,
            hasNext = hasNext,
        )
    }

    @Transactional(readOnly = true)
    fun getProduct(productId: Long, currentUserId: Long?): ProductResponse {
        val product = productRepository.findById(productId)
            .orElseThrow { AppException.NotFound(ErrorCode.PRODUCT_NOT_FOUND) }
        return ProductResponse.from(
            product,
            isLiked = isLikedBy(currentUserId, productId),
            isFavorited = isFavoritedBy(currentUserId, productId),
        )
    }

    @Transactional(readOnly = true)
    fun getCategories(): List<String> = productRepository.findDistinctCategories()

    @Transactional
    fun toggleLike(productId: Long, userId: Long) {
        val product = productRepository.findById(productId)
            .orElseThrow { AppException.NotFound(ErrorCode.PRODUCT_NOT_FOUND) }

        val existing = productLikeRepository.findByUserIdAndProductId(userId, productId)
        if (existing.isPresent) {
            productLikeRepository.delete(existing.get())
            product.likeCount = (product.likeCount - 1).coerceAtLeast(0)
        } else {
            productLikeRepository.save(ProductLikeEntity(userId = userId, productId = productId))
            product.likeCount += 1
        }
    }

    private fun isLikedBy(userId: Long?, productId: Long): Boolean {
        if (userId == null) return false
        return productLikeRepository.existsByUserIdAndProductId(userId, productId)
    }

    private fun isFavoritedBy(userId: Long?, productId: Long): Boolean {
        if (userId == null) return false
        return favoriteRepository.existsByUserIdAndProductId(userId, productId)
    }
}
