package com.jonathanspereira.condoflow.occurrence.entity;

import lombok.Data;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import java.time.LocalDateTime;
import com.jonathanspereira.condoflow.condominium.entity.Condominium;

@Data
@Entity
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
