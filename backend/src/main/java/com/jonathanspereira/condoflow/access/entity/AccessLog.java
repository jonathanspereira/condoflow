package com.jonathanspereira.condoflow.access.entity;

import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "access_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "condominium_id", nullable = false)
    private Condominium condominium;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "authorization_id", nullable = false)
    private AccessAuthorization authorization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concierge_id", nullable = false)
    private User concierge;

    @Column(nullable = false)
    private LocalDateTime entryTime;

    private LocalDateTime exitTime;

    // QR_CODE or PIN
    private String validationMethod;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
