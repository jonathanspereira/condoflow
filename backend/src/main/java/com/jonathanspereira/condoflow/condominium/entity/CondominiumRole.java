package com.jonathanspereira.condoflow.condominium.entity;

import com.jonathanspereira.condoflow.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;

import com.jonathanspereira.condoflow.user.entity.Role;

@Entity
@Data
@Table(name = "condominium_roles", uniqueConstraints = @UniqueConstraint(columnNames = {"condominium_id", "user_id"}))
public class CondominiumRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "condominium_id", nullable = false)
    private Condominium condominium;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "focus_mode_enabled", nullable = false)
    private boolean focusModeEnabled = false;
}