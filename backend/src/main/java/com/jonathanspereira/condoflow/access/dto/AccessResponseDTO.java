package com.jonathanspereira.condoflow.access.dto;

import com.jonathanspereira.condoflow.access.entity.AccessStatus;
import com.jonathanspereira.condoflow.access.entity.AccessType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class AccessResponseDTO {

    private Long id;
    private String personName;
    private String personPhone;
    private String personCpf;
    private String personPhotoUrl;

    private AccessType type;
    private AccessStatus status;

    private String company;
    private String service;
    private String observation;

    private LocalDate authorizedDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private String linkToken;
    private LocalDateTime linkExpiresAt;

    private String accessCode; // UUID
    private String pin; // 4 digits

    private Long unitId;
    private String unitName;
    private String residentName;
    
    private String conciergeName;
    private LocalDateTime entryTime;
    
    private LocalDateTime createdAt;
}
