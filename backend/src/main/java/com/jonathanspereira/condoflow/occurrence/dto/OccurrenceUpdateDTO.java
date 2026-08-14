package com.jonathanspereira.condoflow.occurrence.dto;

import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceStatus;
import jakarta.validation.constraints.NotNull;

public record OccurrenceUpdateDTO(
        @NotNull(message = "O status é obrigatório")
        OccurrenceStatus status,

        String response
) {}
