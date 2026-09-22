package com.jonathanspereira.condoflow.parcel.service;

import com.jonathanspereira.condoflow.common.email.service.EmailService;
import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import com.jonathanspereira.condoflow.parcel.dto.ParcelDeliveryRequestDTO;
import com.jonathanspereira.condoflow.parcel.dto.ParcelRequestDTO;
import com.jonathanspereira.condoflow.parcel.dto.ParcelResponseDTO;
import com.jonathanspereira.condoflow.parcel.entity.Parcel;
import com.jonathanspereira.condoflow.parcel.entity.ParcelStatus;
import com.jonathanspereira.condoflow.parcel.repository.ParcelRepository;
import com.jonathanspereira.condoflow.unit.entity.Unit;
import com.jonathanspereira.condoflow.unit.repository.UnitRepository;
import com.jonathanspereira.condoflow.user.entity.User;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParcelService {

    private final ParcelRepository parcelRepository;
    private final UnitRepository unitRepository;
    private final CondominiumRepository condominiumRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public ParcelResponseDTO registerParcel(Long condominiumId, String receivedByEmail, ParcelRequestDTO requestDTO) {
        Condominium condominium = condominiumRepository.findById(condominiumId)
                .orElseThrow(() -> new IllegalArgumentException("Condominium not found"));

        Unit unit = unitRepository.findById(requestDTO.getUnitId())
                .orElseThrow(() -> new IllegalArgumentException("Unit not found"));

        User receivedBy = userRepository.findByEmail(receivedByEmail)
                .orElseThrow(() -> new IllegalArgumentException("User (Concierge) not found"));

        String deliveryCode = UUID.randomUUID().toString();

        Parcel parcel = Parcel.builder()
                .description(requestDTO.getDescription())
                .recipientName(requestDTO.getRecipientName())
                .trackingCode(requestDTO.getTrackingCode())
                .unit(unit)
                .condominium(condominium)
                .status(ParcelStatus.PENDING_PICKUP)
                .deliveryCode(deliveryCode)
                .receivedBy(receivedBy)
                .build();

        Parcel saved = parcelRepository.save(parcel);

        if (unit.getProprietary() != null) {
            String toEmail = unit.getProprietary().getEmail();
            emailService.sendNewParcelNotification(
                    toEmail,
                    unit.getProprietary().getName(),
                    saved.getDescription(),
                    String.valueOf(saved.getId()),
                    deliveryCode
            );
        }

        return toDTO(saved);
    }

    public Page<ParcelResponseDTO> getParcelsByCondominium(Long condominiumId, Pageable pageable) {
        return parcelRepository.findByCondominiumIdOrderByReceivedAtDesc(condominiumId, pageable)
                .map(this::toDTO);
    }

    public Page<ParcelResponseDTO> getParcelsByUnit(Long unitId, Pageable pageable) {
        return parcelRepository.findByUnitIdOrderByReceivedAtDesc(unitId, pageable)
                .map(this::toDTO);
    }

    @Transactional
    public ParcelResponseDTO deliverParcel(Long condominiumId, String deliveredByEmail, ParcelDeliveryRequestDTO requestDTO) {
        Parcel parcel = parcelRepository.findByDeliveryCodeAndCondominiumId(requestDTO.getDeliveryCode(), condominiumId)
                .orElseThrow(() -> new IllegalArgumentException("Código de liberação inválido ou encomenda não encontrada"));

        if (parcel.getStatus() != ParcelStatus.PENDING_PICKUP) {
            throw new IllegalStateException("Esta encomenda já foi entregue ou devolvida.");
        }

        User deliveredBy = userRepository.findByEmail(deliveredByEmail)
                .orElseThrow(() -> new IllegalArgumentException("User (Concierge) not found"));

        parcel.setStatus(ParcelStatus.DELIVERED);
        parcel.setDeliveredAt(LocalDateTime.now());
        parcel.setDeliveredBy(deliveredBy);

        Parcel saved = parcelRepository.save(parcel);
        return toDTO(saved);
    }

    private ParcelResponseDTO toDTO(Parcel parcel) {
        return ParcelResponseDTO.builder()
                .id(parcel.getId())
                .description(parcel.getDescription())
                .recipientName(parcel.getRecipientName())
                .trackingCode(parcel.getTrackingCode())
                .status(parcel.getStatus())
                .deliveryCode(parcel.getDeliveryCode())
                .receivedAt(parcel.getReceivedAt())
                .deliveredAt(parcel.getDeliveredAt())
                .unitId(parcel.getUnit() != null ? parcel.getUnit().getId() : null)
                .unitName(parcel.getUnit() != null ? parcel.getUnit().getName() : null)
                .receivedByName(parcel.getReceivedBy() != null ? parcel.getReceivedBy().getName() : null)
                .deliveredByName(parcel.getDeliveredBy() != null ? parcel.getDeliveredBy().getName() : null)
                .build();
    }
}
