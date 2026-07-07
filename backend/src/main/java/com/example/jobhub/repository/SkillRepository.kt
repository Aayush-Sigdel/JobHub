package com.example.jobhub.repository

import com.example.jobhub.model.Skill
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SkillRepository : JpaRepository<Skill, UUID> {
    fun findByUserId(userId: UUID): List<Skill>
}
