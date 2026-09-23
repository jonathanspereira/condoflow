package com.jonathanspereira.condoflow.parcel.controller;

import com.jonathanspereira.condoflow.parcel.dto.ParcelDeliveryRequestDTO;
import com.jonathanspereira.condoflow.parcel.dto.ParcelRequestDTO;
import com.jonathanspereira.condoflow.parcel.dto.ParcelResponseDTO;
import com.jonathanspereira.condoflow.parcel.service.ParcelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/parcels")
@RequiredArgsConstructor
public class ParcelController {

    private final ParcelService parcelService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'SINDICO', 'CONCIERGE')")
    public ResponseEntity<ParcelResponseDTO> registerParcel(
            @RequestHeader(value = "X-Tenant-ID", required = false) Long condominiumId,
            @Valid @RequestBody ParcelRequestDTO requestDTO,
            Principal principal) {
        
        ParcelResponseDTO response = parcelService.registerParcel(condominiumId, principal.getName(), requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/condominium")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'SINDICO', 'CONCIERGE')")
    public ResponseEntity<Page<ParcelResponseDTO>> getParcelsByCondominium(
            @RequestHeader(value = "X-Tenant-ID", required = false) Long condominiumId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(parcelService.getParcelsByCondominium(condominiumId, pageable));
    }

    @GetMapping("/unit/{unitId}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'SINDICO', 'CONCIERGE', 'PROPRIETARY', 'TENANT')")
    public ResponseEntity<Page<ParcelResponseDTO>> getParcelsByUnit(
            @PathVariable Long unitId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(parcelService.getParcelsByUnit(unitId, pageable));
    }

    @PostMapping("/deliver")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'SINDICO', 'CONCIERGE')")
    public ResponseEntity<ParcelResponseDTO> deliverParcel(
            @RequestHeader(value = "X-Tenant-ID", required = false) Long condominiumId,
            @Valid @RequestBody ParcelDeliveryRequestDTO requestDTO,
            Principal principal) {
        return ResponseEntity.ok(parcelService.deliverParcel(condominiumId, principal.getName(), requestDTO));
    }
}
