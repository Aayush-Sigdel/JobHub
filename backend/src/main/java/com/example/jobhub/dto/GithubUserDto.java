package com.example.jobhub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GithubUserDto(
        @JsonProperty("login")
        String username,
        String name,
        String bio,
        String company,
        String location,

        @JsonProperty("public_repos")
        Integer publicRepos
) {
}