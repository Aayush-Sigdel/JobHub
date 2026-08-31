package com.example.jobhub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;



public record GithubRepoDto(
        String name,
        @JsonProperty("full_name")
        String fullName,
        String description,
        List<String> topics,
        Boolean fork,
        @JsonProperty("pushed_at")
        String pushedAt
) {}