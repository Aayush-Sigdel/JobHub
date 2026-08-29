package com.example.jobhub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record OrcidPersonDto(
        Name name,
        Biography biography,
        @JsonProperty("keywords")
        Keywords keywords,
        @JsonProperty("researcher-urls")
        ResearcherUrls researcherUrls
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

    public record Keywords(
            List<Keyword> keyword
    ) {}

    public record Keyword(
            String content
    ) {}

    public record ResearcherUrls(
            @JsonProperty("researcher-url")
            List<ResearcherUrl> researcherUrl
    ) {}

    public record ResearcherUrl(
            @JsonProperty("url-name")
            String urlName,
            UrlValue url
    ) {}

    public record UrlValue(
            String value
    ) {}
}