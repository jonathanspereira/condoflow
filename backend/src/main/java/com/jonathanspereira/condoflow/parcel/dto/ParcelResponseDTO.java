package com.jonathanspereira.condoflow.parcel.dto;

import com.jonathanspereira.condoflow.parcel.entity.ParcelStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ParcelResponseDTO {
    private Long id;
    private String description;
    private String recipientName;
    private String trackingCode;
    private ParcelStatus status;
    private String deliveryCode;
    private LocalDateTime receivedAt;
    private LocalDateTime deliveredAt;
    private Long unitId;
    private String unitName;
    private String receivedByName;
    private String deliveredByName;
}
