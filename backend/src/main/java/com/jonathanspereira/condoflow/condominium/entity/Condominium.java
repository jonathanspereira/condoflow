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
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanType plan = PlanType.TRIAL;

    @Column(name = "trial_end_date")
    private java.time.LocalDate trialEndDate;

    @Column(name = "subscription_end_date")
    private java.time.LocalDate subscriptionEndDate;
}