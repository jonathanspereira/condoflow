package com.jonathanspereira.condoflow.condominium.dto;

import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import lombok.Data;

@Data
public class CondominiumResponseDTO {

    private Long id;
    private String name;
    private String cnpj;
    private String address;

    public CondominiumResponseDTO(Condominium condominium) {
        this.id = condominium.getId();
        this.name = condominium.getName();
        this.cnpj = condominium.getCnpj();
        this.address = condominium.getAddress();
    }
}