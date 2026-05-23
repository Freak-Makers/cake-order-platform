package yjh.ontongsal.cakeorderplatform.core.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import java.time.LocalDateTime

@Entity
@Table(
    name = "chat_rooms",
    uniqueConstraints = [
        UniqueConstraint(name = "uk_chat_rooms_customer_admin", columnNames = ["customer_id", "admin_id"]),
    ],
    indexes = [
        Index(name = "idx_chat_rooms_admin_last_msg", columnList = "admin_id, last_message_at DESC"),
    ],
)
class ChatRoomEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    @Column(name = "customer_id", nullable = false)
    val customerId: Long,

    @Column(name = "admin_id", nullable = false)
    val adminId: Long,

    @Column(name = "last_message_at")
    var lastMessageAt: LocalDateTime? = null,

    @Column(name = "last_message_preview", length = 200)
    var lastMessagePreview: String? = null,

    @Column(name = "customer_unread_count", nullable = false)
    var customerUnreadCount: Int = 0,

    @Column(name = "admin_unread_count", nullable = false)
    var adminUnreadCount: Int = 0,
) : BaseEntity()
