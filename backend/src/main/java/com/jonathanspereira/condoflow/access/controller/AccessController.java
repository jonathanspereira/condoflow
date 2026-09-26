package com.jonathanspereira.condoflow.access.controller;

import com.jonathanspereira.condoflow.access.dto.AccessRequestDTO;
import com.jonathanspereira.condoflow.access.dto.AccessResponseDTO;
import com.jonathanspereira.condoflow.access.dto.PublicAccessCompletionDTO;
import com.jonathanspereira.condoflow.access.service.AccessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/access")
@RequiredArgsConstructor
public class AccessController {

    private final AccessService accessService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('PROPRIETARY', 'TENANT')")
    public ResponseEntity<AccessResponseDTO> createAuthorization(
            @RequestHeader(value = "X-Tenant-ID", required = false) Long condominiumId,
            @Valid @RequestBody AccessRequestDTO request,
            Principal principal) {
        return new ResponseEntity<>(accessService.createAuthorization(condominiumId, principal.getName(), request), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyAuthority('PROPRIETARY', 'TENANT')")
    public ResponseEntity<List<AccessResponseDTO>> getMyAuthorizations(Principal principal) {
        return ResponseEntity.ok(accessService.getMyAuthorizations(principal.getName()));
    }

    @GetMapping("/condominium")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'SINDICO', 'CONCIERGE')")
    public ResponseEntity<List<AccessResponseDTO>> getCondominiumAuthorizations(
            @RequestHeader(value = "X-Tenant-ID", required = false) Long condominiumId) {
        return ResponseEntity.ok(accessService.getCondominiumAuthorizations(condominiumId));
    }

    @GetMapping("/public/token/{linkToken}")
    // Endpoint público, sem PreAuthorize
    public ResponseEntity<AccessResponseDTO> getPublicInfoByToken(@PathVariable String linkToken) {
        return ResponseEntity.ok(accessService.getPublicInfoByToken(linkToken));
    }

    @PostMapping("/public/token/{linkToken}/complete")
    // Endpoint público, sem PreAuthorize
    public ResponseEntity<AccessResponseDTO> completePublicRegistration(
            @PathVariable String linkToken,
            @Valid @RequestBody PublicAccessCompletionDTO dto) {
        return ResponseEntity.ok(accessService.completePublicRegistration(linkToken, dto));
    }

    @GetMapping("/validate/{codeOrPin}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'SINDICO', 'CONCIERGE')")
    public ResponseEntity<AccessResponseDTO> validateAccess(
            @RequestHeader(value = "X-Tenant-ID", required = false) Long condominiumId,
            @PathVariable String codeOrPin) {
        return ResponseEntity.ok(accessService.validateAccess(condominiumId, codeOrPin));
    }

    @PostMapping("/register-entry/{accessCode}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'SINDICO', 'CONCIERGE')")
    public ResponseEntity<Void> registerEntry(
            @RequestHeader(value = "X-Tenant-ID", required = false) Long condominiumId,
            @PathVariable String accessCode,
            Principal principal) {
        accessService.registerEntry(condominiumId, principal.getName(), accessCode);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register-exit/{accessCode}")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'SINDICO', 'CONCIERGE')")
    public ResponseEntity<Void> registerExit(
            @RequestHeader(value = "X-Tenant-ID", required = false) Long condominiumId,
            @PathVariable String accessCode,
            Principal principal) {
        accessService.registerExit(condominiumId, principal.getName(), accessCode);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'SINDICO', 'PROPRIETARY', 'TENANT')")
    public ResponseEntity<Void> cancelAuthorization(@PathVariable Long id, Principal principal) {
        accessService.cancelAuthorization(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/renew-link")
    @PreAuthorize("hasAnyAuthority('PROPRIETARY', 'TENANT')")
    public ResponseEntity<AccessResponseDTO> renewLink(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(accessService.renewLink(id, principal.getName()));
    }
}
