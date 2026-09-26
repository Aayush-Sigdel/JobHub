package com.example.jobhub.model.collab

import com.example.jobhub.model.User
import com.example.jobhub.model.job.WorkplaceType
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.UpdateTimestamp
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "collab_projects")
class CollabProject {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null

    @Column(nullable = false)
    var title: String = ""

    @Column(columnDefinition = "TEXT", nullable = false)
    var description: String = ""

    @Column(columnDefinition = "TEXT")
    var goals: String? = null

    var location: String? = null

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var workplaceType: WorkplaceType = WorkplaceType.REMOTE

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: ProjectStatus = ProjectStatus.RECRUITING

    /** Total headcount including the owner. */
    @Column(nullable = false)
    var teamSize: Int = 3

    var commitmentHoursPerWeek: Int? = null

    var durationWeeks: Int? = null

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    var owner: User? = null

    @OneToMany(mappedBy = "project", cascade = [CascadeType.ALL], orphanRemoval = true)
    var roles: MutableList<CollabProjectRole> = mutableListOf()

    @JdbcTypeCode(SqlTypes.VECTOR)
    @Column(columnDefinition = "vector(256)")
    var embedding: FloatArray? = null

    @Version
    var version: Long? = null

    @CreationTimestamp
    var createdAt: Instant? = null

    @UpdateTimestamp
    var updatedAt: Instant? = null

    constructor()

    constructor(
        title: String,
        description: String,
        goals: String?,
        location: String?,
        workplaceType: WorkplaceType,
        status: ProjectStatus,
        teamSize: Int,
        commitmentHoursPerWeek: Int?,
        durationWeeks: Int?,
        owner: User,
        embedding: FloatArray?
    ) {
        this.title = title
        this.description = description
        this.goals = goals
        this.location = location
        this.workplaceType = workplaceType
        this.status = status
        this.teamSize = teamSize
        this.commitmentHoursPerWeek = commitmentHoursPerWeek
        this.durationWeeks = durationWeeks
        this.owner = owner
        this.embedding = embedding
    }
}
