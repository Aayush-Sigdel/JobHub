package com.example.jobhub.repository

import com.example.jobhub.model.Experience
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ExperienceRepository : JpaRepository<Experience, UUID> {

    fun findByIdAndUserId(id: UUID, userId: UUID): Experience?
}
