package com.example.jobhub.model.task;

import com.example.jobhub.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "task_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID taskId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TaskType taskType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String code;

    @Column(nullable = false)
    private boolean passed;

    @Column(nullable = false)
    private double achievedScore;

    @Column(nullable = false)
    private double requiredScore;

    @Column
    private String message = null;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "solved_by", nullable = false)
    private User solvedBy;

    public TaskSubmission(
            UUID taskId,
            TaskType taskType,
            String code,
            boolean passed,
            double achievedScore,
            double requiredScore,
            User solvedBy
    ) {
        this.taskId = taskId;
        this.taskType = taskType;
        this.code = code;
        this.passed = passed;
        this.achievedScore = achievedScore;
        this.requiredScore = requiredScore;
        this.solvedBy = solvedBy;
    }

    public TaskSubmission(
            UUID taskId,
            TaskType taskType,
            String code,
            boolean passed,
            double achievedScore,
            double requiredScore,
            String message,
            User solvedBy
    ) {
        this.taskId = taskId;
        this.taskType = taskType;
        this.code = code;
        this.passed = passed;
        this.achievedScore = achievedScore;
        this.requiredScore = requiredScore;
        this.message = message;
        this.solvedBy = solvedBy;
    }
}
