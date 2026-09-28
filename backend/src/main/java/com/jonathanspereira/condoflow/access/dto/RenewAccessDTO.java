package com.jonathanspereira.condoflow.access.dto;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class RenewAccessDTO {
    private LocalDate authorizedDate;
    private LocalTime startTime;
    private LocalTime endTime;
}
