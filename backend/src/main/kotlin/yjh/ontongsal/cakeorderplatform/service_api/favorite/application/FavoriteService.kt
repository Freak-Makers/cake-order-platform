package yjh.ontongsal.cakeorderplatform.service_api.favorite.application

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import yjh.ontongsal.cakeorderplatform.core.exception.AppException
import yjh.ontongsal.cakeorderplatform.core.exception.ErrorCode
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.FavoriteEntity
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.FavoriteRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.repository.ProductRepository
import yjh.ontongsal.cakeorderplatform.service_api.favorite.presentation.FavoriteResponse

@Service
class FavoriteService(
    private val favoriteRepository: FavoriteRepository,
    private val productRepository: ProductRepository,
) {
    @Transactional
    fun addFavorite(userId: Long, productId: Long) {
        if (!productRepository.existsById(productId)) {
            throw AppException.NotFound(ErrorCode.PRODUCT_NOT_FOUND)
        }
        // 멱등성 — 이미 찜한 상태면 그대로 통과 (사용자 입장에서 add 가 두 번 일어나도 안전).
        if (favoriteRepository.existsByUserIdAndProductId(userId, productId)) return
        favoriteRepository.save(FavoriteEntity(userId = userId, productId = productId))
    }

    @Transactional
    fun removeFavorite(userId: Long, productId: Long) {
        val existing = favoriteRepository.findByUserIdAndProductId(userId, productId)
        if (existing.isPresent) {
            favoriteRepository.delete(existing.get())
        }
        // 없으면 그대로 통과 (이미 제거된 상태)
    }

    @Transactional(readOnly = true)
    fun getMyFavorites(userId: Long): List<FavoriteResponse> {
        val favorites = favoriteRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
        if (favorites.isEmpty()) return emptyList()
        val products = productRepository.findAllById(favorites.map { it.productId })
            .associateBy { it.id }
        return favorites.mapNotNull { fav ->
            val product = products[fav.productId] ?: return@mapNotNull null
            FavoriteResponse.from(fav, product)
        }
    }
}
