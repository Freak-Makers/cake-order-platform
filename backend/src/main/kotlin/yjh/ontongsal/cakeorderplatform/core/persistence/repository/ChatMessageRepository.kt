package yjh.ontongsal.cakeorderplatform.core.persistence.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ChatMessageEntity

interface ChatMessageRepository : JpaRepository<ChatMessageEntity, Long> {

    @Query(
        value = """
            select m from ChatMessageEntity m
            where m.chatRoomId = :chatRoomId
            order by m.createdAt desc, m.id desc
        """,
        countQuery = """
            select count(m) from ChatMessageEntity m where m.chatRoomId = :chatRoomId
        """,
    )
    fun findAllByChatRoomId(chatRoomId: Long, pageable: Pageable): Page<ChatMessageEntity>
}
