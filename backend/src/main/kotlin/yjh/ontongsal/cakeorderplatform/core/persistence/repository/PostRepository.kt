package yjh.ontongsal.cakeorderplatform.core.persistence.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.PostEntity

interface PostRepository :
    JpaRepository<PostEntity, Long>,
    JpaSpecificationExecutor<PostEntity> {

    @Modifying
    @Query("update PostEntity p set p.viewCount = p.viewCount + 1 where p.id = :id")
    fun incrementViewCount(@Param("id") id: Long)
}
