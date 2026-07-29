package com.jonathanspereira.condoflow.condominium.dto;

import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import java.time.LocalDateTime;

public record CondominiumResponseDTO(
        String id,
        String name,
        String cnpj,
        String address,
        LocalDateTime createdAt
) {
    // Construtor utilitário para converter da Entidade para o DTO
    public CondominiumResponseDTO(Condominium entity) {
        this(String.valueOf(entity.getId()), entity.getName(), entity.getCnpj(), entity.getAddress(), entity.getCreatedAt());
    }
}