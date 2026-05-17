package yjh.ontongsal.cakeorderplatform.core.persistence.repository

import org.springframework.data.jpa.repository.JpaRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.UserEntity

interface UserRepository : JpaRepository<UserEntity, Long> {
    fun findBySocialId(socialId: String): UserEntity?
}
