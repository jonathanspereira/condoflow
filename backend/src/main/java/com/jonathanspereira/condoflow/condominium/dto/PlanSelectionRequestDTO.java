package com.jonathanspereira.condoflow.condominium.dto;

import com.jonathanspereira.condoflow.condominium.entity.PlanType;
import jakarta.validation.constraints.NotNull;

public record PlanSelectionRequestDTO(
        @NotNull(message = "O plano deve ser informado.")
        PlanType plan
) {}
