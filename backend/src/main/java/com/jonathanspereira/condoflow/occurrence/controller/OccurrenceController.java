package com.jonathanspereira.condoflow.occurrence.controller;

import com.jonathanspereira.condoflow.occurrence.dto.OccurrenceRequestDTO;
import com.jonathanspereira.condoflow.occurrence.dto.OccurrenceResponseDTO;
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
@CrossOrigin(origins = "*")
public class OccurrenceController {

    private final OccurrenceService service;

    @PostMapping
    public ResponseEntity<OccurrenceResponseDTO> create(@RequestBody @Valid OccurrenceRequestDTO dto, Principal principal) {
        OccurrenceResponseDTO response = service.create(principal.getName(), dto);
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
}