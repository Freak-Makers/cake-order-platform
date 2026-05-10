package yjh.ontongsal.cakeorderplatform.core.persistence.repository

import org.springframework.data.jpa.repository.JpaRepository
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.User

interface UserRepository : JpaRepository<User, Long> {
    fun findBySocialId(socialId: String): User?
}
