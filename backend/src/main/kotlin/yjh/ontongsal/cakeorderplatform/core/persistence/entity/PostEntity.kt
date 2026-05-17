package yjh.ontongsal.cakeorderplatform.core.persistence.entity

import jakarta.persistence.*
import org.hibernate.annotations.SQLDelete
import org.hibernate.annotations.SQLRestriction
import java.time.LocalDateTime

@Entity
@Table(name = "posts")
@SQLDelete(sql = "UPDATE posts SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
class PostEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    @Column
    var productId: Long? = null,

    @Column(nullable = false)
    var title: String,

    @Column(nullable = false, length = 4000)
    var content: String,

    @Column
    var imageUrl: String? = null,

    @Column(nullable = false)
    var viewCount: Long = 0,

    @Column(nullable = false)
    var likeCount: Int = 0,

    @Column(nullable = false)
    var isNotice: Boolean = false,

    @Column
    var deletedAt: LocalDateTime? = null,
) : BaseEntity()
