package com.example.jobhub.security

import com.example.jobhub.model.User
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.util.UUID

class UserPrincipal(
    user: User
) : UserDetails {

    val id: UUID = user.id
    val email: String = user.email
    private val password: String = user.password

    override fun getUsername() = id.toString()

    override fun getPassword() = password

    override fun getAuthorities() = emptyList<GrantedAuthority>()
}