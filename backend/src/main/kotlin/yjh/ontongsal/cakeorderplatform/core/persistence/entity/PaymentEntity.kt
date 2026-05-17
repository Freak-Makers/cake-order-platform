package yjh.ontongsal.cakeorderplatform.core.persistence.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "payments")
class PaymentEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    @Column(nullable = false, unique = true)
    val reservationId: Long,

    @Column(nullable = false)
    val userId: Long,

    @Column(nullable = false)
    val amount: Long,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: PaymentStatus,

    @Column
    var paidAt: LocalDateTime? = null,

    @Column(unique = true)
    var paymentKey: String? = null,

    @Column
    var orderId: String? = null,
) : BaseEntity()
