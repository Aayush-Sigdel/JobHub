package com.example.jobhub.security

import com.example.jobhub.repository.UserRepository
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UserDetailsServiceImpl(
    private val userRepository: UserRepository
): UserDetailsService {

    override fun loadUserByUsername(id: String): UserDetails {
        val user = userRepository.findById(UUID.fromString(id))
            .orElseThrow { UsernameNotFoundException("User not found") }
        return UserPrincipal(user)
    }
}