package yjh.ontongsal.cakeorderplatform.core.persistence.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import yjh.ontongsal.cakeorderplatform.core.persistence.entity.ChatRoomEntity

interface ChatRoomRepository : JpaRepository<ChatRoomEntity, Long> {

    fun findByCustomerIdAndAdminId(customerId: Long, adminId: Long): ChatRoomEntity?

    fun findAllByCustomerIdOrderByLastMessageAtDesc(customerId: Long, pageable: Pageable): Page<ChatRoomEntity>

    // 관리자 채팅방 목록 — 안 읽음이 있는 방 우선, 그 다음 최신 메시지 순.
    @Query(
        value = """
            select r from ChatRoomEntity r
            where r.adminId = :adminId
            order by (case when r.adminUnreadCount > 0 then 0 else 1 end) asc,
                     r.lastMessageAt desc,
                     r.id desc
        """,
        countQuery = """
            select count(r) from ChatRoomEntity r where r.adminId = :adminId
        """,
    )
    fun findAllForAdmin(adminId: Long, pageable: Pageable): Page<ChatRoomEntity>
}
