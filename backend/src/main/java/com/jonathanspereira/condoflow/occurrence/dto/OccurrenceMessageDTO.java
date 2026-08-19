package com.jonathanspereira.condoflow.occurrence.dto;

import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceMessage;

import java.time.LocalDateTime;

public record OccurrenceMessageDTO(
        Long id,
        String content,
        String senderName,
        String senderRole,
        LocalDateTime createdAt
) {
    public OccurrenceMessageDTO(OccurrenceMessage message) {
        this(
                message.getId(),
                message.getContent(),
                message.getSender() != null ? message.getSender().getName() : "Sistema",
                message.getSender() != null ? (message.getSender().getRole() != null ? message.getSender().getRole().name() : "USER") : "SYSTEM",
                message.getCreatedAt()
        );
    }
}
