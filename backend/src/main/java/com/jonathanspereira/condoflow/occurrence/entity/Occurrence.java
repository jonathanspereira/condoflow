package com.jonathanspereira.condoflow.occurrence.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import com.jonathanspereira.condoflow.condominium.entity.Condominium;

@Data
@Entity
@Table(name = "occurrence")
public class Occurrence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String protocol;

    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    private OccurrenceStatus status;

    @ManyToOne
    private Condominium condominium;

    private LocalDateTime createdAt;

}
