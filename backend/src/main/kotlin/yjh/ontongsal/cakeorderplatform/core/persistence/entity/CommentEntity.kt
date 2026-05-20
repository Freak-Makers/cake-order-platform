package yjh.ontongsal.cakeorderplatform.core.persistence.entity

import jakarta.persistence.*
import org.hibernate.annotations.SQLDelete
import org.hibernate.annotations.SQLRestriction
import java.time.LocalDateTime

@Entity
@Table(name = "comments")
@SQLDelete(sql = "UPDATE comments SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
class CommentEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    @Column(nullable = false)
    val postId: Long,

    @Column(nullable = false)
    val userId: Long,

    @Column(nullable = false, length = 1000)
    var content: String,

    @Column
    var deletedAt: LocalDateTime? = null,
) : BaseEntity()
