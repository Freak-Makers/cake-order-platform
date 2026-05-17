package yjh.ontongsal.cakeorderplatform.core.persistence.entity

import jakarta.persistence.*
import org.hibernate.annotations.SQLDelete
import org.hibernate.annotations.SQLRestriction
import java.time.LocalDateTime

@Entity
@Table(name = "reservation_slots")
@SQLDelete(sql = "UPDATE reservation_slots SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
class ReservationSlotEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    @Column(nullable = false)
    val startAt: LocalDateTime,

    @Column
    var deletedAt: LocalDateTime? = null,
) : BaseEntity()
