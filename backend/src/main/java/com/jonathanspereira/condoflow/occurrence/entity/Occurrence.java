package com.jonathanspereira.condoflow.occurrence.entity;

import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.unit.entity.Unit;
import com.jonathanspereira.condoflow.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

@Data
@Entity
@Table(name = "occurrence")
@FilterDef(name = "tenantFilter", parameters = {@ParamDef(name = "tenantId", type = Long.class)})
@Filter(name = "tenantFilter", condition = "condominium_id = :tenantId")
public class Occurrence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String protocol;

    private String title;

    private String description;

    @Column(columnDefinition = "TEXT")
    private String response;

    @Enumerated(EnumType.STRING)
    private OccurrenceCategory category;

    @Enumerated(EnumType.STRING)
    private OccurrenceStatus status;

    @ManyToOne
    private Condominium condominium;

    @ManyToOne
    @JoinColumn(name = "unit_id")
    private Unit unit;

    @ManyToOne
    @JoinColumn(name = "reported_by_id")
    private User reportedBy;

    @Column(name = "related_units", length = 500)
    private String relatedUnits;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "occurrence", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<OccurrenceMessage> messages = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "occurrence", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<OccurrenceAttachment> attachments = new java.util.ArrayList<>();

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.protocol == null) {
            this.protocol = generateProtocol();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    private String generateProtocol() {
        int year = LocalDateTime.now().getYear();
        String suffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "CF-" + year + "-" + suffix;
    }
}