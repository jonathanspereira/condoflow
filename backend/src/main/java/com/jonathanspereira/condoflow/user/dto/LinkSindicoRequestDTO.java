package com.jonathanspereira.condoflow.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LinkSindicoRequestDTO(
        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "E-mail inválido")
        String email,

        String name // obrigatório apenas se o usuário ainda não existir
) {}