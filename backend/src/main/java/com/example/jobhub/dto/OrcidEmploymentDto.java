package com.example.jobhub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
public record OrcidEmploymentDto(
        @JsonProperty("affiliation-group")
        List<AffiliationGroup> affiliationGroup
) {

    public record AffiliationGroup(
            List<Summary> summaries
    ) {}

    public record Summary(
            @JsonProperty("employment-summary")
            EmploymentSummary employmentSummary
    ) {}

    public record EmploymentSummary(
            @JsonProperty("role-title")
            String roleTitle,

            @JsonProperty("department-name")
            String departmentName,

            Organization organization,

            @JsonProperty("start-date")
            DatePart startDate,

            @JsonProperty("end-date")
            DatePart endDate
    ) {}

    public record Organization(
            String name
    ) {}

    public record DatePart(
            Value year,
            Value month
    ) {}

    public record Value(
            String value
    ) {}
}