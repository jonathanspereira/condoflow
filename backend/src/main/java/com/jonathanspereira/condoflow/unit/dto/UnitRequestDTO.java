package com.jonathanspereira.condoflow.unit.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UnitRequestDTO {

    @NotBlank(message = "A unidade é obrigatória")
    private String unit;

    @NotBlank(message = "O nome é obrigatório")
    private String name;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "E-mail inválido")
    private String email;

    private String role;
}