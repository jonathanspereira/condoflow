package com.jonathanspereira.condoflow.condominium.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tb_condominiums")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Condominium {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String cnpj;

    @Column(nullable = false)
    private String street;

    @Column(nullable = false)
    private String number;

    @Column(nullable = false)
    private String zipCode;

    @Column(nullable = false)
    private String neighborhood;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanType plan = PlanType.FREE;

    @Column(name = "trial_end_date")
    private java.time.LocalDate trialEndDate;

    @Column(name = "subscription_end_date")
    private java.time.LocalDate subscriptionEndDate;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "condominium", cascade = CascadeType.REMOVE)
    private java.util.List<CondominiumRole> roles = new java.util.ArrayList<>();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(cascade = CascadeType.REMOVE)
    @JoinColumn(name = "condominium_id", updatable = false, insertable = false)
    private java.util.List<com.jonathanspereira.condoflow.unit.entity.Unit> units = new java.util.ArrayList<>();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "condominium", cascade = CascadeType.REMOVE)
    private java.util.List<com.jonathanspereira.condoflow.occurrence.entity.Occurrence> occurrences = new java.util.ArrayList<>();
}