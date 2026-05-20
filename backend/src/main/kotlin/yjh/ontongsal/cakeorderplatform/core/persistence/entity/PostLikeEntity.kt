package yjh.ontongsal.cakeorderplatform.core.persistence.entity

import jakarta.persistence.*

@Entity
@Table(
    name = "post_likes",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["userId", "postId"])
    ]
)
class PostLikeEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    @Column(nullable = false)
    val userId: Long,

    @Column(nullable = false)
    val postId: Long,
)
