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

        org.springframework.security.core.userdetails.UserDetails userDetails = userRepository.findByEmail(receivedByEmail);
        if (userDetails == null) {
            throw new IllegalArgumentException("User (Concierge) not found");
        }
        User receivedBy = (User) userDetails;

        String deliveryCode = parcelRepository.findFirstByUnitIdAndStatusOrderByReceivedAtDesc(unit.getId(), ParcelStatus.PENDING_PICKUP)
                .map(Parcel::getDeliveryCode)
                .orElseGet(() -> UUID.randomUUID().toString());

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

        if (unit.getOwner() != null) {
            String toEmail = unit.getOwner().getEmail();
            emailService.sendNewParcelNotification(
                    toEmail,
                    unit.getOwner().getName(),
                    saved.getDescription(),
                    String.valueOf(saved.getId()),
                    deliveryCode
            );
        }

        return toDTO(saved);
    }

    @Transactional
    public java.util.List<ParcelResponseDTO> registerParcelBatch(Long condominiumId, String receivedByEmail, com.jonathanspereira.condoflow.parcel.dto.ParcelBatchRequestDTO requestDTO) {
        Condominium condominium = condominiumRepository.findById(condominiumId)
                .orElseThrow(() -> new IllegalArgumentException("Condominium not found"));

        Unit unit = unitRepository.findById(requestDTO.getUnitId())
                .orElseThrow(() -> new IllegalArgumentException("Unit not found"));

        org.springframework.security.core.userdetails.UserDetails userDetails = userRepository.findByEmail(receivedByEmail);
        if (userDetails == null) {
            throw new IllegalArgumentException("User (Concierge) not found");
        }
        User receivedBy = (User) userDetails;

        String deliveryCode = parcelRepository.findFirstByUnitIdAndStatusOrderByReceivedAtDesc(unit.getId(), ParcelStatus.PENDING_PICKUP)
                .map(Parcel::getDeliveryCode)
                .orElseGet(() -> UUID.randomUUID().toString());

        java.util.List<Parcel> savedParcels = new java.util.ArrayList<>();
        for (com.jonathanspereira.condoflow.parcel.dto.ParcelItemDTO item : requestDTO.getParcels()) {
            Parcel parcel = Parcel.builder()
                    .description(item.getDescription())
                    .recipientName(item.getRecipientName())
                    .trackingCode(item.getTrackingCode())
                    .unit(unit)
                    .condominium(condominium)
                    .status(ParcelStatus.PENDING_PICKUP)
                    .deliveryCode(deliveryCode)
                    .receivedBy(receivedBy)
                    .build();
            savedParcels.add(parcelRepository.save(parcel));
        }

        if (unit.getOwner() != null && !savedParcels.isEmpty()) {
            String toEmail = unit.getOwner().getEmail();
            String parcelDesc = savedParcels.size() + " pacote(s) aguardando retirada.";
            emailService.sendNewParcelNotification(
                    toEmail,
                    unit.getOwner().getName(),
                    parcelDesc,
                    String.valueOf(savedParcels.get(0).getId()),
                    deliveryCode
            );
        }

        return savedParcels.stream().map(this::toDTO).toList();
    }

    public Page<ParcelResponseDTO> getParcelsByCondominium(Long condominiumId, ParcelStatus status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return parcelRepository.findByCondominiumIdWithFilters(condominiumId, status, startDate, endDate, pageable)
                .map(this::toDTO);
    }

    public Page<ParcelResponseDTO> getParcelsByUnit(Long unitId, ParcelStatus status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return parcelRepository.findByUnitIdWithFilters(unitId, status, startDate, endDate, pageable)
                .map(this::toDTO);
    }

    public java.util.List<ParcelResponseDTO> getParcelsByDeliveryCode(Long condominiumId, String deliveryCode) {
        return parcelRepository.findByDeliveryCodeAndCondominiumId(deliveryCode, condominiumId).stream()
                .filter(p -> p.getStatus() == ParcelStatus.PENDING_PICKUP)
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public ParcelResponseDTO deliverParcel(Long condominiumId, String deliveredByEmail, ParcelDeliveryRequestDTO requestDTO) {
        java.util.List<Parcel> parcels = parcelRepository.findByDeliveryCodeAndCondominiumId(requestDTO.getDeliveryCode(), condominiumId);
        
        if (parcels.isEmpty()) {
            throw new IllegalArgumentException("Código de liberação inválido ou encomenda não encontrada");
        }
        
        Parcel parcel = parcels.stream().filter(p -> p.getStatus() == ParcelStatus.PENDING_PICKUP).findFirst()
                .orElseThrow(() -> new IllegalStateException("Esta encomenda já foi entregue ou devolvida."));

        org.springframework.security.core.userdetails.UserDetails userDetails = userRepository.findByEmail(deliveredByEmail);
        if (userDetails == null) {
            throw new IllegalArgumentException("User (Concierge) not found");
        }
        User deliveredBy = (User) userDetails;

        parcel.setStatus(ParcelStatus.DELIVERED);
        parcel.setDeliveredAt(LocalDateTime.now());
        parcel.setDeliveredBy(deliveredBy);

        Parcel saved = parcelRepository.save(parcel);
        return toDTO(saved);
    }

    @Transactional
    public java.util.List<ParcelResponseDTO> deliverParcelBatch(Long condominiumId, String deliveredByEmail, com.jonathanspereira.condoflow.parcel.dto.ParcelBatchDeliveryRequestDTO requestDTO) {
        org.springframework.security.core.userdetails.UserDetails userDetails = userRepository.findByEmail(deliveredByEmail);
        if (userDetails == null) {
            throw new IllegalArgumentException("User (Concierge) not found");
        }
        User deliveredBy = (User) userDetails;

        java.util.List<ParcelResponseDTO> delivered = new java.util.ArrayList<>();
        for (Long id : requestDTO.getParcelIds()) {
            Parcel parcel = parcelRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Encomenda não encontrada: " + id));

            if (!parcel.getCondominium().getId().equals(condominiumId)) {
                throw new IllegalArgumentException("Encomenda pertence a outro condomínio: " + id);
            }

            if (parcel.getStatus() != ParcelStatus.PENDING_PICKUP) {
                continue;
            }

            parcel.setStatus(ParcelStatus.DELIVERED);
            parcel.setDeliveredAt(LocalDateTime.now());
            parcel.setDeliveredBy(deliveredBy);
            
            delivered.add(toDTO(parcelRepository.save(parcel)));
        }

        return delivered;
    }

    public Page<ParcelResponseDTO> getMyParcels(String userEmail, ParcelStatus status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        org.springframework.security.core.userdetails.UserDetails userDetails = userRepository.findByEmail(userEmail);
        if (userDetails == null) {
            throw new IllegalArgumentException("User not found");
        }
        User user = (User) userDetails;

        Unit unit = unitRepository.findByOwnerId(user.getId())
                .or(() -> unitRepository.findByTenantId(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Unidade não encontrada para este usuário"));

        return getParcelsByUnit(unit.getId(), status, startDate, endDate, pageable);
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
                .unitName(parcel.getUnit() != null ? parcel.getUnit().getUnit() : null)
                .receivedByName(parcel.getReceivedBy() != null ? parcel.getReceivedBy().getName() : null)
                .deliveredByName(parcel.getDeliveredBy() != null ? parcel.getDeliveredBy().getName() : null)
                .build();
    }
}
