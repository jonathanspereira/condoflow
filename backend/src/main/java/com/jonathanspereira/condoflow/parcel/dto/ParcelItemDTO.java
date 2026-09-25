package com.jonathanspereira.condoflow.parcel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParcelItemDTO {

    @NotBlank(message = "Descrição é obrigatória")
    private String description;

    @NotBlank(message = "Nome do destinatário é obrigatório")
    private String recipientName;

    @NotBlank(message = "Código de rastreio é obrigatório")
    private String trackingCode;
}
