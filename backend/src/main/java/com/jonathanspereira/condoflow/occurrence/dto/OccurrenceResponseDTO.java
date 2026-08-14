package com.jonathanspereira.condoflow.occurrence.dto;

import com.jonathanspereira.condoflow.occurrence.entity.Occurrence;

import java.time.LocalDateTime;

public record OccurrenceResponseDTO(
        String id,
        String protocol,
        String title,
        String description,
        String response,
        String category,
        String status,
        String condominiumName,
        String unitName,
        String authorName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public OccurrenceResponseDTO(Occurrence entity) {
        this(
                String.valueOf(entity.getId()),
                entity.getProtocol(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getResponse(),
                entity.getCategory() != null ? entity.getCategory().name() : null,
                entity.getStatus().name(),
                entity.getCondominium().getName(),
                entity.getUnit() != null ? entity.getUnit().getUnit() : null,
                entity.getReportedBy() != null ? entity.getReportedBy().getName() : null,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}