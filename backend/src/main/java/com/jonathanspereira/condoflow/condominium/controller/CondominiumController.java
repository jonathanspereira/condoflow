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
@CrossOrigin(origins = "*")
public class CondominiumController {

    // A declaração correta da dependência fica aqui no topo da classe
    private final CondominiumService condominiumService;

    @PostMapping
    public ResponseEntity<CondominiumResponseDTO> create(@RequestBody @Valid CondominiumRequestDTO requestDTO) {
        CondominiumResponseDTO response = condominiumService.create(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<CondominiumResponseDTO>> findAll() {
        List<CondominiumResponseDTO> response = condominiumService.findAll();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CondominiumResponseDTO> update(@PathVariable Long id, @RequestBody @Valid CondominiumRequestDTO requestDTO) {
        // Agora ele chama o service da classe corretamente
        CondominiumResponseDTO response = condominiumService.update(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        condominiumService.delete(id);
        return ResponseEntity.noContent().build();
    }
}