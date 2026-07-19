package com.jonathanspereira.condoflow.condominium.controller;

import com.jonathanspereira.condoflow.condominium.dto.CondominiumRequestDTO;
import com.jonathanspereira.condoflow.condominium.dto.CondominiumResponseDTO;
import com.jonathanspereira.condoflow.condominium.service.CondominiumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/condominiums")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Ajuste depois para a URL exata do frontend
public class CondominiumController {

    private final CondominiumService service;

    @PostMapping
    public ResponseEntity<CondominiumResponseDTO> create(@RequestBody @Valid CondominiumRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<CondominiumResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CondominiumResponseDTO> findById(@PathVariable String id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CondominiumResponseDTO> update(@PathVariable String id, @RequestBody @Valid CondominiumRequestDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}