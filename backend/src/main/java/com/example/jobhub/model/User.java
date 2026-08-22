package com.example.jobhub.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.validation.constraints.Email;

import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    @Email
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private boolean employer;

    @Column(nullable = false)
    private boolean onboardingCompleted = false;

    private String title;

    private boolean verified = false;

    private String bio;

    private String location;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Skill> skills = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Experience> experiences = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SocialLink> socialLinks = new ArrayList<>();

    private String imageUrl;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Education> educations = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_contact_numbers")
    @Column(name = "contact_number")
    private List<String> contactNumbers = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.VECTOR)
    @Column(columnDefinition = "vector(256)")
    private float[] githubEmbedding;

    @JdbcTypeCode(SqlTypes.VECTOR)
    @Column(columnDefinition = "vector(256)")
    private float[] orcidEmbedding;

    @JdbcTypeCode(SqlTypes.VECTOR)
    @Column(columnDefinition = "vector(256)")
    private float[] portfolioEmbedding;

    @JdbcTypeCode(SqlTypes.VECTOR)
    @Column(columnDefinition = "vector(256)")
    private float[] profileEmbedding;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    public User(String email, String name, String password, boolean employer, String imageUrl){
        this.email = email;
        this.name = name;
        this.password = password;
        this.employer = employer;
        this.imageUrl = imageUrl;
    }
}