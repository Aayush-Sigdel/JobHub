package com.example.jobhub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record OrcidPersonDto(
        Name name,
        Biography biography
) {

    public record Name(
            @JsonProperty("given-names")
            Value givenNames,

            @JsonProperty("family-name")
            Value familyName
    ) {}

    public record Biography(
            String content
    ) {}

    public record Value(
            String value
    ) {}
}