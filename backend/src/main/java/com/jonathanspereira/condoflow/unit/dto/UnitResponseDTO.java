package com.jonathanspereira.condoflow.unit.dto;

import com.jonathanspereira.condoflow.unit.entity.Unit;
import lombok.Data;

@Data
public class UnitResponseDTO {
    private Long id;
    private String unit;
    private Long condominiumId;
    private String ownerId;
    private String ownerName;
    private String ownerEmail;
    private boolean rented;
    private String tenantId;
    private String tenantName;
    private String tenantEmail;

    public static UnitResponseDTO from(Unit entity) {
        UnitResponseDTO dto = new UnitResponseDTO();
        dto.setId(entity.getId());
        dto.setUnit(entity.getUnit());
        dto.setCondominiumId(entity.getCondominiumId());
        dto.setOwnerId(entity.getOwner().getId());
        dto.setOwnerName(entity.getOwner().getName());
        dto.setOwnerEmail(entity.getOwner().getEmail());
        dto.setRented(entity.isRented());
        if (entity.getTenant() != null) {
            dto.setTenantId(entity.getTenant().getId());
            dto.setTenantName(entity.getTenant().getName());
            dto.setTenantEmail(entity.getTenant().getEmail());
        }
        return dto;
    }
}