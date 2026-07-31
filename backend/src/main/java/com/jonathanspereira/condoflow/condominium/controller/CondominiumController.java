package com.jonathanspereira.condoflow.condominium.controller;
import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.service.CondominiumService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/condominiums")
@CrossOrigin(origins = "*")
public class CondominiumController {

    @Autowired
    private CondominiumService condominiumService;

    @GetMapping
    public ResponseEntity<List<Condominium>> listarCondominios() {
        return ResponseEntity.ok(condominiumService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Condominium> buscarPorId(@PathVariable Long id) {
        return condominiumService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Condominium> criarCondominio(@RequestBody Condominium condominium) {
        Condominium novoCondominio = condominiumService.salvar(condominium);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoCondominio);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Condominium> atualizarCondominio(
            @PathVariable Long id,
            @RequestBody Condominium condominium) {
        Condominium atualizado = condominiumService.atualizar(id, condominium);
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCondominio(@PathVariable Long id) {
        condominiumService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}