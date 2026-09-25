package com.jonathanspereira.condoflow.access.dto;

import com.jonathanspereira.condoflow.access.entity.AccessType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AccessRequestDTO {
    
    @NotBlank(message = "O nome da pessoa é obrigatório")
    private String personName;
    
    private String personPhone;

    @NotNull(message = "A data autorizada é obrigatória")
    private LocalDate authorizedDate;

    @NotNull(message = "O horário inicial é obrigatório")
    private LocalTime startTime;

    @NotNull(message = "O horário final é obrigatório")
    private LocalTime endTime;

    @NotNull(message = "O tipo de acesso é obrigatório")
    private AccessType type;

    // Apenas para Prestadores/Entregadores
    private String company;
    private String service;
    private String observation;
}
