package com.jonathanspereira.condoflow.parcel.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ParcelBatchRequestDTO {

    @NotNull(message = "ID da unidade é obrigatório")
    private Long unitId;

    @NotEmpty(message = "A lista de encomendas não pode estar vazia")
    @Valid
    private List<ParcelItemDTO> parcels;
}
