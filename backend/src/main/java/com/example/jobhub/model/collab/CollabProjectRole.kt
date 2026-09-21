package com.example.jobhub.model.collab

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "collab_project_roles")
class CollabProjectRole {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    var project: CollabProject? = null

    @Column(nullable = false)
    var title: String = ""

    @Column(columnDefinition = "TEXT")
    var description: String? = null

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "collab_role_required_skills",
        joinColumns = [JoinColumn(name = "role_id")]
    )
    var requiredSkills: MutableList<RequiredSkill> = mutableListOf()

    @Column(nullable = false)
    var filled: Boolean = false

    constructor()

    constructor(
        project: CollabProject,
        title: String,
        description: String?,
        requiredSkills: MutableList<RequiredSkill>
    ) {
        this.project = project
        this.title = title
        this.description = description
        this.requiredSkills = requiredSkills
    }
}
