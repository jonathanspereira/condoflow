package com.jonathanspereira.condoflow.occurrence.dto;

import com.jonathanspereira.condoflow.occurrence.entity.Occurrence;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
        String relatedUnits,
        String authorName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<OccurrenceMessageDTO> messages,
        List<OccurrenceAttachmentDTO> attachments
) {
    public OccurrenceResponseDTO(Occurrence entity) {
        this(
                String.valueOf(entity.getId()),
                entity.getProtocol(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getResponse(),
                entity.getCategory() != null ? entity.getCategory().name() : null,
                entity.getStatus() != null ? entity.getStatus().name() : null,
                entity.getCondominium() != null ? entity.getCondominium().getName() : null,
                entity.getUnit() != null ? entity.getUnit().getUnit() : null,
                entity.getRelatedUnits(),
                entity.getReportedBy() != null ? entity.getReportedBy().getName() : null,
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getMessages() != null ? entity.getMessages().stream().map(OccurrenceMessageDTO::new).collect(Collectors.toList()) : List.of(),
                entity.getAttachments() != null ? entity.getAttachments().stream().map(att -> {
                    OccurrenceAttachmentDTO dto = new OccurrenceAttachmentDTO();
                    dto.setId(att.getId());
                    dto.setFileName(att.getFileName());
                    dto.setFileType(att.getFileType());
                    dto.setCreatedAt(att.getCreatedAt());
                    return dto;
                }).collect(Collectors.toList()) : List.of()
        );
    }
}