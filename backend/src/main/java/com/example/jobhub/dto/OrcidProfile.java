package com.example.jobhub.dto;

import java.util.List;

public record OrcidProfile(
        String orcidId,
        String fullName,
        String biography,
        List<String> keywords,
        List<ResearcherUrl> researcherUrls,
        List<Employment> employments,
        List<Work> works
) {
    public record ResearcherUrl(
            String name,
            String url
    ) {}

    public record Employment(
            String roleTitle,
            String departmentName,
            String organization,
            String startDate,
            String endDate
    ) {}

    public record Work(
            String title,
            String type,
            String journalTitle,
            String publicationYear
    ) {}
}
