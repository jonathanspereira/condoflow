package com.jonathanspereira.condoflow.user.dto;

import com.jonathanspereira.condoflow.unit.entity.Unit;
import com.jonathanspereira.condoflow.user.entity.Role;
import com.jonathanspereira.condoflow.user.entity.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponseDTO {

    private String id;
    private String name;
    private String email;
    private Role role;
    private String condominiumName;

    private Long unitId;
    private String unitName;
    private Boolean isRented;
    private String tenantName;
    private String tenantEmail;

    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole();
        if (user.getCondominium() != null) {
            this.condominiumName = user.getCondominium().getName();
        }
    }

    public UserResponseDTO(User user, Unit unit) {
        this(user);
        if (unit != null) {
            this.unitId = unit.getId();
            this.unitName = unit.getUnit();
            this.isRented = unit.isRented();
            if (unit.isRented() && unit.getTenant() != null) {
                this.tenantName = unit.getTenant().getName();
                this.tenantEmail = unit.getTenant().getEmail();
            }
        }
    }
}