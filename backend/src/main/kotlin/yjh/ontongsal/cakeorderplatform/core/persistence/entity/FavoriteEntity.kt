package yjh.ontongsal.cakeorderplatform.core.persistence.entity

import jakarta.persistence.*

@Entity
@Table(
    name = "favorites",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["userId", "productId"])
    ]
)
class FavoriteEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    @Column(nullable = false)
    val userId: Long,

    @Column(nullable = false)
    val productId: Long,
) : BaseEntity()
