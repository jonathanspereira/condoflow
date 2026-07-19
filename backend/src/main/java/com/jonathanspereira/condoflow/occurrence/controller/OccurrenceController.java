package com.jonathanspereira.condoflow.occurrence.controller;

import com.jonathanspereira.condoflow.occurrence.dto.OccurrenceRequestDTO;
import com.jonathanspereira.condoflow.occurrence.dto.OccurrenceResponseDTO;
import com.jonathanspereira.condoflow.occurrence.service.OccurrenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/occurrences")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Para permitir requisições do front
public class OccurrenceController {

    private final OccurrenceService service;

    @PostMapping
    public ResponseEntity<OccurrenceResponseDTO> create(@RequestBody @Valid OccurrenceRequestDTO dto) {
        OccurrenceResponseDTO response = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}