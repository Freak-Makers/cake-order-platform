package yjh.ontongsal.cakeorderplatform.core.persistence.entity

import jakarta.persistence.*

@Entity
@Table(name = "reviews")
class ReviewEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    @Column(nullable = false)
    val productId: Long,

    @Column(nullable = false)
    val userId: Long,

    @Column(nullable = false, length = 1000)
    var content: String,

    @Column(nullable = false)
    var rating: Int,

    @Column(nullable = false)
    var likeCount: Int = 0,
) : BaseEntity()
