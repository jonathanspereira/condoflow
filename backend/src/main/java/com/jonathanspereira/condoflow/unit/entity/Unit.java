package com.jonathanspereira.condoflow.unit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tb_units")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String unit; // Ex: Apto 101

    @Column(nullable = false)
    private String name; // Nome do proprietário/morador

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String role; // Ex: PROPRIETARY

    @Column(name = "condominium_id", nullable = false)
    private Long condominiumId;
}