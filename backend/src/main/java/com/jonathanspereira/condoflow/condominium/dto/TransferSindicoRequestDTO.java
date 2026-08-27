package com.jonathanspereira.condoflow.condominium.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record TransferSindicoRequestDTO(
        @NotBlank(message = "O e-mail do novo síndico é obrigatório.")
        @Email(message = "E-mail inválido.")
        String email,

        @NotBlank(message = "O nome do novo síndico é obrigatório.")
        String name
) {
}
