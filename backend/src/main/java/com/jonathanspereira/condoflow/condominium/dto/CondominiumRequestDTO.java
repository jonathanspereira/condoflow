package com.jonathanspereira.condoflow.condominium.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CondominiumRequestDTO {

    @NotBlank(message = "O nome do condomínio é obrigatório")
    private String name;

    @NotBlank(message = "O CNPJ é obrigatório")
    private String cnpj;

    @NotBlank(message = "A rua é obrigatória")
    private String street;

    @NotBlank(message = "O número é obrigatório")
    private String number;

    @NotBlank(message = "O CEP é obrigatório")
    private String zipCode;

    @NotBlank(message = "O bairro é obrigatório")
    private String neighborhood;

    @NotBlank(message = "A cidade é obrigatória")
    private String city;

    @NotBlank(message = "O estado é obrigatório")
    private String state;
}