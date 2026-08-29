package com.example.jobhub.dto;

import java.util.List;

public record StackoverflowWrapper<T>(List<T> items) {}