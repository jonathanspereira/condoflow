package com.jonathanspereira.condoflow.parcel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ParcelDeliveryRequestDTO {
    @NotBlank(message = "O código de liberação (deliveryCode) é obrigatório")
    private String deliveryCode;
}
