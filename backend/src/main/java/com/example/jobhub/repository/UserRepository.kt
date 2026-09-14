package com.example.jobhub.repository

import com.example.jobhub.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface UserRepository : JpaRepository<User, UUID>, CollabCandidateSearchRepository {

    fun findByEmail(email: String): User?
    fun existsByEmail(email: String): Boolean

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.skills WHERE u.id IN :ids")
    fun findAllWithSkillsByIdIn(@Param("ids") ids: List<UUID>): List<User>
}
