package com.example.jobhub.model.task;

import com.example.jobhub.model.SkillLevel;
import com.example.jobhub.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "programming_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgrammingTask {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private SkillLevel skillLevel;

    @Enumerated(EnumType.STRING)
    private TaskScope scope;

    @Column(nullable = false)
    private String methodName;

    @ElementCollection(fetch = FetchType.EAGER)
    @OrderColumn(name = "param_order")
    private List<Parameter> parameters;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DataType returnType;

    @Column(nullable = false)
    private boolean orderInsensitiveOutput;

    @Column(columnDefinition = "TEXT")
    private String testCasesJson;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    public ProgrammingTask(
            String title,
            String instructions,
            SkillLevel skillLevel,
            TaskScope scope,
            String methodName,
            List<Parameter> parameters,
            DataType returnType,
            boolean orderInsensitiveOutput,
            String testCasesJson,
            User createdBy){

        this.title = title;
        this.instructions = instructions;
        this.skillLevel = skillLevel;
        this.scope = scope;
        this.methodName = methodName;
        this.parameters = parameters;
        this.returnType = returnType;
        this.orderInsensitiveOutput = orderInsensitiveOutput;
        this.testCasesJson = testCasesJson;
        this.createdBy = createdBy;
    }
}
