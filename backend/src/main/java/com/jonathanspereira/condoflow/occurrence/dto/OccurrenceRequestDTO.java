package com.jonathanspereira.condoflow.occurrence.dto;

import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OccurrenceRequestDTO(
        @NotBlank(message = "O título é obrigatório")
        String title,

        @NotBlank(message = "A descrição é obrigatória")
        String description,

        @NotNull(message = "A categoria é obrigatória")
        OccurrenceCategory category,

        Long unitId
) {
    public OccurrenceRequestDTO(String title, String description, OccurrenceCategory category) {
        this(title, description, category, null);
    }
}