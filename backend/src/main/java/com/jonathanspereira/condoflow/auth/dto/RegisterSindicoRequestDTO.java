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

    @NotBlank(message = "Rua do condomínio é obrigatória")
    private String condominiumStreet;

    @NotBlank(message = "Número do condomínio é obrigatório")
    private String condominiumNumber;

    @NotBlank(message = "CEP do condomínio é obrigatório")
    private String condominiumZipCode;

    @NotBlank(message = "Bairro do condomínio é obrigatório")
    private String condominiumNeighborhood;

    @NotBlank(message = "Cidade do condomínio é obrigatória")
    private String condominiumCity;

    @NotBlank(message = "Estado do condomínio é obrigatório")
    private String condominiumState;

    private String plan; // optional, since default is FREE, but we can accept it for the wizard
}
