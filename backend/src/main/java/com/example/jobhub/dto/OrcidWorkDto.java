package com.example.jobhub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record OrcidWorkDto(
        List<WorkGroup> group
) {

    public record WorkGroup(
            @JsonProperty("work-summary")
            List<WorkSummary> workSummary
    ) {}

    public record WorkSummary(
            Title title,
            String type,
            @JsonProperty("journal-title")
            TitleValue journalTitle,
            @JsonProperty("publication-date")
            PublicationDate publicationDate
    ) {}

    public record Title(
            @JsonProperty("title")
            TitleValue title
    ) {}

    public record TitleValue(
            String value
    ) {}

    public record PublicationDate(
            DateValue year,
            DateValue month
    ) {}

    public record DateValue(
            String value
    ) {}
}