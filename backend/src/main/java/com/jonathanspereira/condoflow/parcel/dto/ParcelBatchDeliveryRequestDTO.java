package com.jonathanspereira.condoflow.parcel.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParcelBatchDeliveryRequestDTO {

    @NotEmpty(message = "A lista de encomendas a serem entregues não pode estar vazia")
    private List<Long> parcelIds;
}
