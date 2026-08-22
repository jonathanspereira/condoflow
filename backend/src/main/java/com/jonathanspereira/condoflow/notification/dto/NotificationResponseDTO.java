package com.jonathanspereira.condoflow.notification.dto;

import com.jonathanspereira.condoflow.notification.entity.Notification;

import java.time.LocalDateTime;

public record NotificationResponseDTO(
        Long id,
        String title,
        String message,
        String protocol,
        boolean read,
        LocalDateTime createdAt
) {
    public NotificationResponseDTO(Notification n) {
        this(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getProtocol(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
