package com.example.jobhub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GithubRepoDto(
        String name,
        String description,
        String language,

        @JsonProperty("stargazers_count")
        Integer stars,

        @JsonProperty("forks_count")
        Integer forks,

        @JsonProperty("html_url")
        String repoUrl
) {
}