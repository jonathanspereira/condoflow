package com.jonathanspereira.condoflow.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterSindicoRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    private String name;

    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail inválido")
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    private String password;

    @NotBlank(message = "Nome do condomínio é obrigatório")
    private String condominiumName;

    @NotBlank(message = "CNPJ do condomínio é obrigatório")
    private String condominiumCnpj;

    @NotBlank(message = "Endereço do condomínio é obrigatório")
    private String condominiumAddress;
}
