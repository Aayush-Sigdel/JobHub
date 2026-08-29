package com.example.jobhub.dto;

import java.util.List;
import java.util.Map;
import java.util.Set;

public record GithubProfile(
        String username,
        String name,
        String bio,
        List<Repository> repositories,
        Set<String> uniqueLanguages
) {
    public record Repository(
            String name,
            String description,
            Map<String, Integer> languages,
            List<String> topics,
            boolean isPinned,
            String readme
    ) {}
}