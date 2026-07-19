package com.jonathanspereira.condoflow.occurrence.dto;

import com.jonathanspereira.condoflow.occurrence.entity.Occurrence;
import java.time.LocalDateTime;

public record OccurrenceResponseDTO(
        String id,
        String protocol,
        String title,
        String description,
        String status,
        String condominiumName,
        LocalDateTime createdAt
) {
    public OccurrenceResponseDTO(Occurrence entity) {
        this(
                entity.getId(),
                entity.getProtocol(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getStatus().name(),
                entity.getCondominium().getName(),
                entity.getCreatedAt()
        );
    }
}