package com.jonathanspereira.condoflow.unit.entity;

import com.jonathanspereira.condoflow.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

@Entity
@Data
@Table(name = "tb_units")

@Filter(name = "tenantFilter", condition = "condominium_id = :tenantId")
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "unit", nullable = false)
    private String unit;

    @Column(name = "condominium_id", nullable = false)
    private Long condominiumId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "rented", nullable = false)
    private boolean rented = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private User tenant;
}