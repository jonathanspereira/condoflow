package com.jonathanspereira.condoflow.condominium.entity;

import com.jonathanspereira.condoflow.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "condominium_manager", uniqueConstraints = @UniqueConstraint(columnNames = {"condominium_id", "sindico_id"}))
public class CondominiumManager {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "condominium_id", nullable = false)
    private Condominium condominium;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sindico_id", nullable = false)
    private User sindico;

    @Column(name = "focus_mode_enabled", nullable = false)
    private boolean focusModeEnabled = false;
}