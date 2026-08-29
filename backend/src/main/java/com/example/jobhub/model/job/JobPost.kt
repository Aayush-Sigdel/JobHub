package com.example.jobhub.model.job

import com.example.jobhub.model.SkillLevel
import com.example.jobhub.model.User
import com.example.jobhub.model.task.DesignTask
import com.example.jobhub.model.task.ProgrammingTask
import com.example.jobhub.model.task.SQLTask
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.UpdateTimestamp
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "job_posts")
class JobPost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null

    @Column(nullable = false)
    var title: String = ""

    @Column(nullable = false)
    var companyName: String = ""

    @Column(columnDefinition = "TEXT", nullable = false)
    var description: String = ""

    @Column(columnDefinition = "TEXT")
    var requirements: String? = null

    var location: String? = null

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var jobType: JobType = JobType.FULL_TIME

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var workplaceType: WorkplaceType = WorkplaceType.REMOTE

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var experienceLevel: SkillLevel = SkillLevel.BEGINNER

    var salaryMin: Double? = null

    var salaryMax: Double? = null

    var salaryCurrency: String? = "USD"

    @Column(nullable = false)
    var tabLock: Boolean = false

    @Column(nullable = false)
    var tabLockWarningLimit: Int = 3

    var deadline: Instant? = null

    @Column(nullable = false)
    var isActive: Boolean = true

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "posted_by", nullable = false)
    var postedBy: User? = null

    // Attached assignments (Maximum 1 per task type)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "design_task_id")
    var designTask: DesignTask? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programming_task_id")
    var programmingTask: ProgrammingTask? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sql_task_id")
    var sqlTask: SQLTask? = null

    @JdbcTypeCode(SqlTypes.VECTOR)
    @Column(columnDefinition = "vector(256)")
    var embedding: FloatArray? = null

    @CreationTimestamp
    var createdAt: Instant? = null

    @UpdateTimestamp
    var updatedAt: Instant? = null

    constructor()

    constructor(
        title: String,
        companyName: String,
        description: String,
        requirements: String?,
        location: String?,
        jobType: JobType,
        workplaceType: WorkplaceType,
        experienceLevel: SkillLevel,
        salaryMin: Double?,
        salaryMax: Double?,
        salaryCurrency: String?,
        tabLock: Boolean,
        tabLockWarningLimit: Int,
        deadline: Instant?,
        isActive: Boolean,
        postedBy: User,
        designTask: DesignTask?,
        programmingTask: ProgrammingTask?,
        sqlTask: SQLTask?,
        embedding: FloatArray?
    ) {
        this.title = title
        this.companyName = companyName
        this.description = description
        this.requirements = requirements
        this.location = location
        this.jobType = jobType
        this.workplaceType = workplaceType
        this.experienceLevel = experienceLevel
        this.salaryMin = salaryMin
        this.salaryMax = salaryMax
        this.salaryCurrency = salaryCurrency
        this.tabLock = tabLock
        this.tabLockWarningLimit = tabLockWarningLimit
        this.deadline = deadline
        this.isActive = isActive
        this.postedBy = postedBy
        this.designTask = designTask
        this.programmingTask = programmingTask
        this.sqlTask = sqlTask
        this.embedding = embedding
    }
}
