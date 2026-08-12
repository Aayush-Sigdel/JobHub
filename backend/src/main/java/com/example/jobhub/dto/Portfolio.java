package com.example.jobhub.dto;

import java.util.List;

public record Portfolio(
        String url,
        String title,
        String description,
        List<String> headings,
        List<String> paragraphs,
        List<String> links,
        List<String> jsonLd
) {}