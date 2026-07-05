package com.example.jobhub.repository

import com.example.jobhub.model.User
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface UserRepository : JpaRepository<User, UUID> {

    fun findByEmail(email: String): User?
    fun existsByEmail(email: String): Boolean
}