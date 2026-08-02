package com.jonathanspereira.condoflow.unit.controller;

import com.jonathanspereira.condoflow.unit.dto.UnitRequestDTO;
import com.jonathanspereira.condoflow.unit.dto.UnitResponseDTO;
import com.jonathanspereira.condoflow.unit.entity.Unit;
import com.jonathanspereira.condoflow.unit.service.UnitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/units")
public class UnitController {

    @Autowired
    private UnitService unitService;

    @GetMapping("/condominium/{condoId}")
    public ResponseEntity<List<UnitResponseDTO>> listarUnidadesPorCondominio(@PathVariable Long condoId) {
        List<UnitResponseDTO> unidades = unitService.listarPorCondominio(condoId)
                .stream().map(UnitResponseDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(unidades);
    }

    @PostMapping
    public ResponseEntity<UnitResponseDTO> criarUnidade(@RequestBody UnitRequestDTO dto, @RequestParam Long condominiumId) {
        Unit novaUnidade = unitService.salvar(condominiumId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(UnitResponseDTO.from(novaUnidade));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UnitResponseDTO> atualizarUnidade(@PathVariable Long id, @RequestBody UnitRequestDTO dto) {
        Unit unidadeAtualizada = unitService.atualizar(id, dto);
        return ResponseEntity.ok(UnitResponseDTO.from(unidadeAtualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarUnidade(@PathVariable Long id) {
        unitService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}