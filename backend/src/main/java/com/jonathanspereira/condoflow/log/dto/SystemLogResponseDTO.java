package com.jonathanspereira.condoflow.log.dto;

import com.jonathanspereira.condoflow.log.entity.SystemLog;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SystemLogResponseDTO {
    private Long id;
    private String type;
    private String action;
    private String message;
    private String status;
    private String details;
    private String target;
    private LocalDateTime createdAt;

    public SystemLogResponseDTO(SystemLog log) {
        this.id = log.getId();
        this.type = log.getType();
        this.action = log.getAction();
        this.message = log.getMessage();
        this.status = log.getStatus();
        this.details = log.getDetails();
        this.target = log.getTarget();
        this.createdAt = log.getCreatedAt();
    }
}
