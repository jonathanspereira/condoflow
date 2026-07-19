package com.jonathanspereira.condoflow.condominium.dto;

import jakarta.validation.constraints.NotBlank;

public record CondominiumRequestDTO(
        @NotBlank(message = "O nome é obrigatório")
        String name,

        @NotBlank(message = "O endereço é obrigatório")
        String address
) {}