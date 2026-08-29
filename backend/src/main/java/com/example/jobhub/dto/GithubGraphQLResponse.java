package com.example.jobhub.dto;

import java.util.List;

public record GithubGraphQLResponse(Data data) {
    public record Data(User user) {}
    public record User(PinnedItems pinnedItems) {}
    public record PinnedItems(List<Node> nodes) {}
    public record Node(String name) {}
}