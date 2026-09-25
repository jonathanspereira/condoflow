package com.jonathanspereira.condoflow.auth.dto;

import lombok.Data;

@Data
public class AuthResponseDTO {
    private String token;
    private String name;
    private String email;
    private String role;
    private boolean forcePasswordChange;
    private Long condominiumId;

    public AuthResponseDTO(String token, String name, String email, String role, boolean forcePasswordChange) {
        this.token = token;
        this.name = name;
        this.email = email;
        this.role = role;
        this.forcePasswordChange = forcePasswordChange;
    }

    public AuthResponseDTO(String token, String name, String email, String role, boolean forcePasswordChange, Long condominiumId) {
        this.token = token;
        this.name = name;
        this.email = email;
        this.role = role;
        this.forcePasswordChange = forcePasswordChange;
        this.condominiumId = condominiumId;
    }
}