package com.jonathanspereira.condoflow.access.entity;

import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.unit.entity.Unit;
import com.jonathanspereira.condoflow.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "access_authorizations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccessAuthorization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "condominium_id", nullable = false)
    private Condominium condominium;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private Unit unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resident_id")
    private User resident;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccessType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccessStatus status;

    // Person details
    private String personName;
    private String personPhone;
    private String personCpf;
    @Column(columnDefinition = "TEXT")
    private String personPhotoUrl;

    // Additional info for providers/delivery
    private String company;
    private String service;
    private String observation;

    // Schedule
    @Column(nullable = false)
    private LocalDate authorizedDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    // Tokens & Credentials
    private String linkToken;
    private LocalDateTime linkExpiresAt;

    private String accessCode; // UUID used in QR Code
    private String pin; // 4 digits

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
