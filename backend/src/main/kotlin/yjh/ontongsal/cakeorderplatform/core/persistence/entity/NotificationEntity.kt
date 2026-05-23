package yjh.ontongsal.cakeorderplatform.core.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(
    name = "notifications",
    indexes = [
        Index(name = "idx_notifications_recipient_created", columnList = "recipient_user_id, created_at DESC, id DESC"),
    ],
)
class NotificationEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    @Column(name = "recipient_user_id", nullable = false)
    val recipientUserId: Long,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    val type: NotificationType,

    @Column(nullable = false, length = 100)
    val title: String,

    @Column(nullable = false, length = 500)
    val body: String,

    @Column(name = "link_url", length = 255)
    val linkUrl: String? = null,

    @Column(name = "read_at")
    var readAt: LocalDateTime? = null,
) : BaseEntity()
