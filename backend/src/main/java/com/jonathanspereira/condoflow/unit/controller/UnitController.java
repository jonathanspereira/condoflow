package com.jonathanspereira.condoflow.unit.controller;

import com.jonathanspereira.condoflow.unit.entity.Unit;
import com.jonathanspereira.condoflow.unit.service.UnitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/units")
@CrossOrigin(origins = "*")
public class UnitController {

    @Autowired
    private UnitService unitService;

    @GetMapping("/condominium/{condoId}")
    public ResponseEntity<List<Unit>> listarUnidadesPorCondominio(@PathVariable Long condoId) {
        List<Unit> unidades = unitService.listarPorCondominio(condoId);
        return ResponseEntity.ok(unidades);
    }

    @PostMapping
    public ResponseEntity<Unit> criarUnidade(@RequestBody Unit unit) {
        Unit novaUnidade = unitService.salvar(unit.getCondominiumId(), unit);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaUnidade);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Unit> atualizarUnidade(
            @PathVariable Long id,
            @RequestBody Unit unit) {
        Unit unidadeAtualizada = unitService.atualizar(id, unit);
        return ResponseEntity.ok(unidadeAtualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarUnidade(@PathVariable Long id) {
        unitService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}