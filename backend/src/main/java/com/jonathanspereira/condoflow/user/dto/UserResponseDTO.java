package com.jonathanspereira.condoflow.user.dto;

import com.jonathanspereira.condoflow.user.entity.User;

public record UserResponseDTO(
        String id,
        String name,
        String email,
        String role,
        String condominiumName
) {
    public UserResponseDTO(User entity) {
        this(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getRole().name(),
                entity.getCondominium() != null ? entity.getCondominium().getName() : "Global"
        );
    }
}