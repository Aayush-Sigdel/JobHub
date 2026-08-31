package com.example.jobhub.model.job

import com.example.jobhub.model.User
import com.example.jobhub.model.task.TaskSubmission
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.UpdateTimestamp
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "job_applications",
    uniqueConstraints = [
        UniqueConstraint(
            name = "uk_job_candidate_application",
            columnNames = ["job_post_id", "candidate_id"]
        )
    ]
)
class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_post_id", nullable = false)
    var jobPost: JobPost? = null

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidate_id", nullable = false)
    var candidate: User? = null

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: ApplicationStatus = ApplicationStatus.APPLIED

    var similarityScore: Double? = null

    @Column(nullable = false)
    var tabSwitchCount: Int = 0

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    var tabSwitchEventsJson: String? = null

    @Column(columnDefinition = "TEXT")
    var coverNote: String? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "design_submission_id")
    var designSubmission: TaskSubmission? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programming_submission_id")
    var programmingSubmission: TaskSubmission? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sql_submission_id")
    var sqlSubmission: TaskSubmission? = null

    @Version
    var version: Long? = null

    @CreationTimestamp
    var createdAt: Instant? = null

    @UpdateTimestamp
    var updatedAt: Instant? = null

    constructor()

    constructor(
        jobPost: JobPost,
        candidate: User,
        status: ApplicationStatus = ApplicationStatus.APPLIED,
        similarityScore: Double? = null,
        tabSwitchCount: Int = 0,
        tabSwitchEventsJson: String? = null,
        coverNote: String? = null,
        designSubmission: TaskSubmission? = null,
        programmingSubmission: TaskSubmission? = null,
        sqlSubmission: TaskSubmission? = null
    ) {
        this.jobPost = jobPost
        this.candidate = candidate
        this.status = status
        this.similarityScore = similarityScore
        this.tabSwitchCount = tabSwitchCount
        this.tabSwitchEventsJson = tabSwitchEventsJson
        this.coverNote = coverNote
        this.designSubmission = designSubmission
        this.programmingSubmission = programmingSubmission
        this.sqlSubmission = sqlSubmission
    }
}
