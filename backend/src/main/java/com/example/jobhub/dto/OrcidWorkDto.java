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
            Title title
    ) {}

    public record Title(
            @JsonProperty("title")
            TitleValue title
    ) {}

    public record TitleValue(
            String value
    ) {}
}