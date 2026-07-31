package com.jonathanspereira.condoflow.unit.dto;

import com.jonathanspereira.condoflow.unit.entity.Unit;
import lombok.Data;

@Data
public class UnitResponseDTO {

    private Long id;
    private String unit;
    private String proprietario; // Mapeado a partir de 'name'
    private String email;
    private String role;
    private Long condominiumId;

    public UnitResponseDTO(Unit unitEntity) {
        this.id = unitEntity.getId();
        this.unit = unitEntity.getUnit();
        this.proprietario = unitEntity.getName();
        this.email = unitEntity.getEmail();
        this.role = unitEntity.getRole();
        this.condominiumId = unitEntity.getCondominiumId();
    }
}