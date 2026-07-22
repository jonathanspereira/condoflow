package com.jonathanspereira.condoflow.user.dto;

import com.jonathanspereira.condoflow.user.entity.Role;
import com.jonathanspereira.condoflow.user.entity.User;

public class UserResponseDTO {

    private String id;
    private String name;
    private String email;
    private Role role;
    private String condominiumName;

    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole();
        if (user.getCondominium() != null) {
            this.condominiumName = user.getCondominium().getName();
        }
    }


}