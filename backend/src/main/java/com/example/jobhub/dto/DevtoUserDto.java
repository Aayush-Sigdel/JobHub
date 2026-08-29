package com.example.jobhub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DevtoUserDto(
        String typeOf,
        Long id,
        String username,
        String name,
        String summary,

        @JsonProperty("twitter_username")
        String twitterUsername,

        @JsonProperty("github_username")
        String githubUsername,

        @JsonProperty("website_url")
        String websiteUrl,

        String location,

        @JsonProperty("joined_at")
        String joinedAt
) {}