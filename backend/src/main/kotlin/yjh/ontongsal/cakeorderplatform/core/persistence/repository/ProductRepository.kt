package yjh.ontongsal.cakeorderplatform.core.persistence.repository

import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ProductEntity
import java.time.LocalDateTime

interface ProductRepository : JpaRepository<ProductEntity, Long> {

    @Query(
        """
        SELECT p FROM ProductEntity p
        WHERE (:category IS NULL OR p.category = :category)
          AND (
            :lastCreatedAt IS NULL
            OR p.createdAt < :lastCreatedAt
            OR (p.createdAt = :lastCreatedAt AND p.id < :lastId)
          )
        ORDER BY p.createdAt DESC, p.id DESC
        """,
    )
    fun findLatestPage(
        @Param("category") category: String?,
        @Param("lastCreatedAt") lastCreatedAt: LocalDateTime?,
        @Param("lastId") lastId: Long?,
        pageable: Pageable,
    ): List<ProductEntity>

    @Query(
        """
        SELECT p FROM ProductEntity p
        WHERE (:category IS NULL OR p.category = :category)
          AND (
            :lastPrice IS NULL
            OR p.price > :lastPrice
            OR (p.price = :lastPrice AND p.id > :lastId)
          )
        ORDER BY p.price ASC, p.id ASC
        """,
    )
    fun findPriceAscPage(
        @Param("category") category: String?,
        @Param("lastPrice") lastPrice: Long?,
        @Param("lastId") lastId: Long?,
        pageable: Pageable,
    ): List<ProductEntity>

    @Query(
        """
        SELECT p FROM ProductEntity p
        WHERE (:category IS NULL OR p.category = :category)
          AND (
            :lastPrice IS NULL
            OR p.price < :lastPrice
            OR (p.price = :lastPrice AND p.id < :lastId)
          )
        ORDER BY p.price DESC, p.id DESC
        """,
    )
    fun findPriceDescPage(
        @Param("category") category: String?,
        @Param("lastPrice") lastPrice: Long?,
        @Param("lastId") lastId: Long?,
        pageable: Pageable,
    ): List<ProductEntity>

    @Query("SELECT DISTINCT p.category FROM ProductEntity p ORDER BY p.category")
    fun findDistinctCategories(): List<String>
}
