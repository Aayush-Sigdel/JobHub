package com.example.jobhub.model.task;

import com.example.jobhub.model.SkillLevel;
import com.example.jobhub.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "design_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignTask {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "bytea")
    private byte[] imageBytes;

    @Column(nullable = false)
    private double minimumMatchingScore;

    @Column(nullable = false)
    private String imageContentType;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private SkillLevel skillLevel;

    @Enumerated(EnumType.STRING)
    private TaskScope scope;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    public DesignTask(
            String title,
            byte[] imageBytes,
            double minimumMatchingScore,
            String imageContentType,
            String instructions,
            SkillLevel skillLevel,
            TaskScope scope,
            User createdBy) {

        this.title = title;
        this.imageBytes = imageBytes;
        this.minimumMatchingScore = minimumMatchingScore;
        this.instructions = instructions;
        this.imageContentType = imageContentType;
        this.skillLevel = skillLevel;
        this.scope = scope;
        this.createdBy = createdBy;
    }
}