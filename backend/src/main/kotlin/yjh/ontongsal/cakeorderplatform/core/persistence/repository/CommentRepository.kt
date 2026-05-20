package yjh.ontongsal.cakeorderplatform.core.persistence.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.CommentEntity

interface CommentRepository : JpaRepository<CommentEntity, Long> {
    // Pageable 의 sort 가 명시적으로 적용되도록 JPQL 로 작성 (derived 메서드의 모호함 회피).
    // countQuery 도 명시 — Spring Data 가 자동 추출하다 sort 절이 섞이는 일을 차단.
    @Query(
        value = "select c from CommentEntity c where c.postId = :postId",
        countQuery = "select count(c) from CommentEntity c where c.postId = :postId",
    )
    fun findAllByPostId(@Param("postId") postId: Long, pageable: Pageable): Page<CommentEntity>

    fun deleteAllByPostId(postId: Long)
}
