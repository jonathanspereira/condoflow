package com.jonathanspereira.condoflow.access.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PublicAccessCompletionDTO {

    @NotBlank(message = "O CPF é obrigatório")
    private String cpf;

    @NotBlank(message = "A foto é obrigatória")
    private String photoBase64;
}
