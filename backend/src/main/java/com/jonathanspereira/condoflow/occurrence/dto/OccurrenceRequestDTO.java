package com.jonathanspereira.condoflow.occurrence.dto;

import jakarta.validation.constraints.NotBlank;

public record OccurrenceRequestDTO(
        @NotBlank(message = "O título é obrigatório")
        String title,

        @NotBlank(message = "A descrição é obrigatória")
        String description,

        @NotBlank(message = "O ID do condomínio é obrigatório")
        String condominiumId
) {}