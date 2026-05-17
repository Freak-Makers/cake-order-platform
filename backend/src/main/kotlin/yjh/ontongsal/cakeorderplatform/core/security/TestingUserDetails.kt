package yjh.ontongsal.cakeorderplatform.core.security

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

class TestingUserDetails(
    val userId: Long,
    private val email: String,
    private val password: String,
    private val authorities: List<GrantedAuthority>,
) : UserDetails {
    override fun getAuthorities(): Collection<GrantedAuthority?> {
        return authorities
    }

    override fun getPassword(): String {
        return password
    }

    override fun getUsername(): String {
        return email
    }
}
