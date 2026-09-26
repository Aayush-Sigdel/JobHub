package com.example.jobhub.model.collab

import com.example.jobhub.model.User
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "collab_memberships",
    uniqueConstraints = [
        UniqueConstraint(
            name = "uk_collab_project_member",
            columnNames = ["project_id", "member_id"]
        )
    ]
)
class CollabMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    var project: CollabProject? = null

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    var member: User? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    var role: CollabProjectRole? = null

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: MembershipStatus = MembershipStatus.INVITED

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var initiatedBy: MembershipInitiator = MembershipInitiator.OWNER

    @Column(columnDefinition = "TEXT")
    var message: String? = null

    @Version
    var version: Long? = null

    @CreationTimestamp
    var createdAt: Instant? = null

    @UpdateTimestamp
    var updatedAt: Instant? = null

    constructor()

    constructor(
        project: CollabProject,
        member: User,
        role: CollabProjectRole?,
        status: MembershipStatus,
        initiatedBy: MembershipInitiator,
        message: String?
    ) {
        this.project = project
        this.member = member
        this.role = role
        this.status = status
        this.initiatedBy = initiatedBy
        this.message = message
    }
}
