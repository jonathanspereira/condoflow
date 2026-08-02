package com.jonathanspereira.condoflow.unit.dto;

import lombok.Data;

@Data
public class UnitRequestDTO {
    private String unit;
    private String ownerName;
    private String ownerEmail;
    private boolean rented;
    private String tenantName;
    private String tenantEmail;
}