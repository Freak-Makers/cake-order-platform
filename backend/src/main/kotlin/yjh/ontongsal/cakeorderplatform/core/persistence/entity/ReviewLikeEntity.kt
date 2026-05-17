package yjh.ontongsal.cakeorderplatform.core.persistence.entity

import jakarta.persistence.*

@Entity
@Table(
    name = "review_likes",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["userId", "reviewId"])
    ]
)
class ReviewLikeEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    @Column(nullable = false)
    val userId: Long,

    @Column(nullable = false)
    val reviewId: Long,
)
