package com.example.jobhub.repository

import com.example.jobhub.model.task.TaskSubmission
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface TaskSubmissionRepository: JpaRepository<TaskSubmission, UUID> {

}