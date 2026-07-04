package com.example.jobhub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GithubUserDto(
        String login,
        String name,
        String bio,
        String company,
        String location,

        @JsonProperty("public_repos")
        Integer publicRepos,

        Integer followers,
        Integer following,

        @JsonProperty("avatar_url")
        String avatarUrl
) {
}