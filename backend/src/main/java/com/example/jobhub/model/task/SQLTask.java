package com.example.jobhub.model.task;

import com.example.jobhub.model.SkillLevel;
import com.example.jobhub.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sql_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SQLTask {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @ElementCollection(fetch = FetchType.EAGER)
    @OrderColumn(name = "query_order")
    private List<String> setupQueries;

    @ElementCollection(fetch = FetchType.EAGER)
    @OrderColumn(name = "assertion_order")
    private List<String> assertions;

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

    public SQLTask(
            String title,
            List<String> setupQueries,
            List<String> assertions,
            String instructions,
            SkillLevel skillLevel,
            TaskScope scope,
            User createdBy) {

        this.title = title;
        this.setupQueries = setupQueries;
        this.assertions = assertions;
        this.instructions = instructions;
        this.skillLevel = skillLevel;
        this.scope = scope;
        this.createdBy = createdBy;
    }
}