package com.example.jobhub.model.task

import jakarta.persistence.Embeddable
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated

@Embeddable
data class Parameter(
    val name: String,

    @Enumerated(EnumType.STRING)
    val type: DataType
)