package com.example.jobhub.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
public class SocialLink {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    private SocialPlatform platform;

    private String url;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;
}