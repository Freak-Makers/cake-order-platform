package yjh.ontongsal.cakeorderplatform.core.persistence.entity

import jakarta.persistence.*

@Entity
@Table(
    name = "product_likes",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["userId", "productId"])
    ]
)
class ProductLikeEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    @Column(nullable = false)
    val userId: Long,

    @Column(nullable = false)
    val productId: Long,
)
