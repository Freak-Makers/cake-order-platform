package yjh.ontongsal.cakeorderplatform.core.persistence.entity

import jakarta.persistence.*

@Entity
@Table(name = "users")
class UserEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    @Column(nullable = false, unique = true)
    val socialId: String,

    @Column(nullable = false)
    var nickname: String,

    @Column
    var email: String? = null,

    @Column
    var profileImageUrl: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val provider: SocialProvider,
) : BaseEntity()
