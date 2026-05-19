package yjh.ontongsal.cakeorderplatform.service_api.favorite.presentation

import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import yjh.ontongsal.cakeorderplatform.core.security.TestingUserDetails
import yjh.ontongsal.cakeorderplatform.service_api.favorite.application.FavoriteService

@RestController
@RequestMapping("/api/v1/favorites")
class FavoriteController(
    private val favoriteService: FavoriteService,
) {
    @PostMapping("/{productId}")
    fun addFavorite(
        @AuthenticationPrincipal userDetails: TestingUserDetails,
        @PathVariable productId: Long,
    ): ResponseEntity<Unit> {
        favoriteService.addFavorite(userDetails.userId, productId)
        return ResponseEntity.ok().build()
    }

    @DeleteMapping("/{productId}")
    fun removeFavorite(
        @AuthenticationPrincipal userDetails: TestingUserDetails,
        @PathVariable productId: Long,
    ): ResponseEntity<Unit> {
        favoriteService.removeFavorite(userDetails.userId, productId)
        return ResponseEntity.ok().build()
    }

    @GetMapping("/my")
    fun getMyFavorites(
        @AuthenticationPrincipal userDetails: TestingUserDetails,
    ): ResponseEntity<List<FavoriteResponse>> {
        return ResponseEntity.ok(favoriteService.getMyFavorites(userDetails.userId))
    }
}
