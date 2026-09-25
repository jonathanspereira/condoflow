package com.jonathanspereira.condoflow.parcel.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ParcelBatchDeliveryRequestDTO {

    @NotEmpty(message = "A lista de encomendas a serem entregues não pode estar vazia")
    private List<Long> parcelIds;
}
