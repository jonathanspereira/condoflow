package com.jonathanspereira.condoflow.occurrence.dto;

import jakarta.validation.constraints.NotBlank;

public record MessageRequestDTO(
        @NotBlank(message = "O conteúdo da mensagem não pode estar vazio.")
        String content
) {
}
