package com.example.jobhub.model

enum class CollaboratorSource(val column: String) {
    PLATFORM("platform_embedding"),
    GITHUB("github_embedding"),
    DEVTO("devto_embedding"),
    STACKOVERFLOW("stackoverflow_embedding"),
    ORCID("orcid_embedding"),
    OVERALL("overall_embedding")
}
