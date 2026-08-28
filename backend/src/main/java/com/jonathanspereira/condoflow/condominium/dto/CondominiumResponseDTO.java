package com.jonathanspereira.condoflow.condominium.dto;

import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import lombok.Data;

@Data
public class CondominiumResponseDTO {

    private Long id;
    private String name;
    private String cnpj;
    private String street;
    private String number;
    private String zipCode;
    private String neighborhood;
    private String city;
    private String state;

    public CondominiumResponseDTO(Condominium condominium) {
        this.id = condominium.getId();
        this.name = condominium.getName();
        this.cnpj = condominium.getCnpj();
        this.street = condominium.getStreet();
        this.number = condominium.getNumber();
        this.zipCode = condominium.getZipCode();
        this.neighborhood = condominium.getNeighborhood();
        this.city = condominium.getCity();
        this.state = condominium.getState();
    }
}