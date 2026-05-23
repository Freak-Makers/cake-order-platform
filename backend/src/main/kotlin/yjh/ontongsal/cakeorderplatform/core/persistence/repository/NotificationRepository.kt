package yjh.ontongsal.cakeorderplatform.core.persistence.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.NotificationEntity
import java.time.LocalDateTime

interface NotificationRepository : JpaRepository<NotificationEntity, Long> {

    @Query(
        value = """
            select n from NotificationEntity n
            where n.recipientUserId = :userId
            order by n.createdAt desc, n.id desc
        """,
        countQuery = """
            select count(n) from NotificationEntity n where n.recipientUserId = :userId
        """,
    )
    fun findAllByRecipientUserId(userId: Long, pageable: Pageable): Page<NotificationEntity>

    fun countByRecipientUserIdAndReadAtIsNull(userId: Long): Long

    fun findByIdAndRecipientUserId(id: Long, recipientUserId: Long): NotificationEntity?

    @Modifying
    @Query("update NotificationEntity n set n.readAt = :now where n.recipientUserId = :userId and n.readAt is null")
    fun markAllRead(@Param("userId") userId: Long, @Param("now") now: LocalDateTime): Int
}
