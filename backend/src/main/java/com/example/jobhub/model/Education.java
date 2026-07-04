package com.example.jobhub.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
public class Education {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String institution;

    private String degree;

    private String fieldOfStudy;

    private Instant startDate;

    private Instant endDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;
}