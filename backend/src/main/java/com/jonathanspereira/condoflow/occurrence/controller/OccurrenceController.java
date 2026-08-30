package com.jonathanspereira.condoflow.occurrence.controller;

import com.jonathanspereira.condoflow.occurrence.dto.AnonymousOccurrenceRequestDTO;
import com.jonathanspereira.condoflow.occurrence.dto.OccurrenceRequestDTO;
import com.jonathanspereira.condoflow.occurrence.dto.OccurrenceResponseDTO;
import com.jonathanspereira.condoflow.occurrence.dto.OccurrenceUpdateDTO;
import com.jonathanspereira.condoflow.occurrence.service.OccurrenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/occurrences")
@RequiredArgsConstructor
public class OccurrenceController {

    private final OccurrenceService service;
    private final com.jonathanspereira.condoflow.common.security.TurnstileService turnstileService;

    @PostMapping
    public ResponseEntity<OccurrenceResponseDTO> create(@RequestBody @Valid OccurrenceRequestDTO dto, Principal principal) {
        if (!turnstileService.verify(dto.turnstileToken())) {
            throw new com.jonathanspereira.condoflow.common.exception.BusinessException("Falha na verificação de segurança antibot.");
        }
        OccurrenceResponseDTO response = service.create(principal.getName(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(value = "/anonymous", consumes = "multipart/form-data")
    public ResponseEntity<OccurrenceResponseDTO> createAnonymous(
            @RequestPart("data") @Valid AnonymousOccurrenceRequestDTO dto,
            @RequestPart(value = "file", required = false) org.springframework.web.multipart.MultipartFile file) {
        if (!turnstileService.verify(dto.turnstileToken())) {
            throw new com.jonathanspereira.condoflow.common.exception.BusinessException("Falha na verificação de segurança antibot.");
        }
        OccurrenceResponseDTO response = service.createAnonymous(dto, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<OccurrenceResponseDTO>> getMine(Principal principal) {
        List<OccurrenceResponseDTO> response = service.findMine(principal.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/protocol/{protocol}")
    public ResponseEntity<OccurrenceResponseDTO> getByProtocol(@PathVariable String protocol) {
        OccurrenceResponseDTO response = service.findByProtocol(protocol);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/condominium/{condominiumId}")
    public ResponseEntity<List<OccurrenceResponseDTO>> getByCondominium(@PathVariable Long condominiumId) {
        List<OccurrenceResponseDTO> response = service.findByCondominium(condominiumId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OccurrenceResponseDTO> update(@PathVariable Long id, @RequestBody @Valid OccurrenceUpdateDTO dto) {
        OccurrenceResponseDTO response = service.update(id, dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<OccurrenceResponseDTO> addMessage(@PathVariable Long id, @RequestBody @Valid com.jonathanspereira.condoflow.occurrence.dto.MessageRequestDTO dto, Principal principal) {
        OccurrenceResponseDTO response = service.addMessage(id, dto, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(value = "/{id}/attachments", consumes = "multipart/form-data")
    public ResponseEntity<OccurrenceResponseDTO> addAttachment(@PathVariable Long id, @RequestParam("file") org.springframework.web.multipart.MultipartFile file, Principal principal) {
        OccurrenceResponseDTO response = service.addAttachment(id, file, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/attachments/{attachmentId}")
    public ResponseEntity<byte[]> getAttachment(@PathVariable Long id, @PathVariable Long attachmentId) {
        com.jonathanspereira.condoflow.occurrence.entity.OccurrenceAttachment attachment = service.getAttachment(id, attachmentId);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                .contentType(org.springframework.http.MediaType.parseMediaType(attachment.getFileType() != null ? attachment.getFileType() : "application/octet-stream"))
                .body(attachment.getFileData());
    }
}