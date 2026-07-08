package com.example.jobhub.repository

import com.example.jobhub.model.Education
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface EducationRepository : JpaRepository<Education, UUID> {

    fun findByIdAndUserId(id: UUID, userId: UUID): Education?
}
