package com.jonathanspereira.condoflow.occurrence.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OccurrenceAttachmentDTO {
    private Long id;
    private String fileName;
    private String fileType;
    private LocalDateTime createdAt;
}
