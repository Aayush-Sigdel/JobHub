package com.example.jobhub.model.collab

import com.example.jobhub.model.SkillLevel
import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated

@Embeddable
class RequiredSkill {

    @Column(name = "skill_name", nullable = false)
    var name: String = ""

    @Enumerated(EnumType.STRING)
    @Column(name = "min_level", nullable = false)
    var minLevel: SkillLevel = SkillLevel.BEGINNER

    constructor()

    constructor(name: String, minLevel: SkillLevel) {
        this.name = name
        this.minLevel = minLevel
    }
}
