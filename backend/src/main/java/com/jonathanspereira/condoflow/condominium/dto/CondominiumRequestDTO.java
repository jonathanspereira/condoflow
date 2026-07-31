package com.jonathanspereira.condoflow.condominium.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CondominiumRequestDTO {

    @NotBlank(message = "O nome do condomínio é obrigatório")
    private String name;

    @NotBlank(message = "O CNPJ é obrigatório")
    private String cnpj;

    @NotBlank(message = "O endereço é obrigatório")
    private String address;
}