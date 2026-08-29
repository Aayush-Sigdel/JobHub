package com.example.jobhub.security

import com.example.jobhub.model.User
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.util.UUID

class UserPrincipal(
    user: User
) : UserDetails {

    val id: UUID = user.id
    val email: String = user.email
    val employer: Boolean = user.isEmployer
    private val password: String = user.password

    override fun getUsername() = id.toString()

    override fun getPassword() = password

    override fun getAuthorities(): List<GrantedAuthority> {
        return if (employer) {
            listOf(SimpleGrantedAuthority("ROLE_EMPLOYER"))
        } else {
            listOf(SimpleGrantedAuthority("ROLE_CANDIDATE"))
        }
    }
}