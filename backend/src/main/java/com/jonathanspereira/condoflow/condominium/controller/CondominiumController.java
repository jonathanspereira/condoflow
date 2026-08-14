package com.jonathanspereira.condoflow.condominium.controller;

import com.jonathanspereira.condoflow.condominium.dto.FocusModeRequestDTO;
import com.jonathanspereira.condoflow.condominium.dto.SindicoCondominiumDTO;
import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.service.CondominiumManagementService;
import com.jonathanspereira.condoflow.condominium.service.CondominiumService;
import com.jonathanspereira.condoflow.user.dto.LinkSindicoRequestDTO;
import com.jonathanspereira.condoflow.user.dto.LinkSindicoResponseDTO;
import com.jonathanspereira.condoflow.user.dto.UserRequestDTO;
import com.jonathanspereira.condoflow.user.dto.UserResponseDTO;
import com.jonathanspereira.condoflow.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/condominiums")
@CrossOrigin(origins = "*")
public class CondominiumController {

    @Autowired
    private CondominiumService condominiumService;

    @Autowired
    private UserService userService;

    @Autowired
    private CondominiumManagementService condominiumManagementService;

    @GetMapping
    public ResponseEntity<List<Condominium>> listarCondominios() {
        return ResponseEntity.ok(condominiumService.listarTodos());
    }

    @GetMapping("/me")
    public ResponseEntity<List<SindicoCondominiumDTO>> listarMeusCondominios(Principal principal) {
        List<SindicoCondominiumDTO> response = condominiumManagementService.listMyCondominiums(principal.getName());
        return ResponseEntity.ok(response);
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

    @PutMapping("/{id}/sindico")
    public ResponseEntity<LinkSindicoResponseDTO> vincularSindico(
            @PathVariable Long id,
            @RequestBody @Valid LinkSindicoRequestDTO dto) {
        LinkSindicoResponseDTO response = userService.linkSindico(id, dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/sindicos")
    public ResponseEntity<List<UserResponseDTO>> getSindicos(@PathVariable Long id) {
        return ResponseEntity.ok(condominiumManagementService.getSindicosForCondominium(id));
    }

    @DeleteMapping("/{id}/sindicos/{sindicoId}")
    public ResponseEntity<Void> removeSindico(@PathVariable Long id, @PathVariable String sindicoId) {
        condominiumManagementService.removeSindico(id, sindicoId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/sindicos/{sindicoId}")
    public ResponseEntity<UserResponseDTO> updateSindico(
            @PathVariable Long id,
            @PathVariable String sindicoId,
            @RequestBody UserRequestDTO dto) {
        return ResponseEntity.ok(condominiumManagementService.updateSindico(id, sindicoId, dto));
    }

    @PutMapping("/{id}/focus-mode")
    public ResponseEntity<Void> alternarModoFoco(
            @PathVariable Long id,
            @RequestBody FocusModeRequestDTO dto,
            Principal principal) {
        condominiumManagementService.setFocusMode(principal.getName(), id, dto.enabled());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/focus-mode")
    public ResponseEntity<Void> alternarModoFocoGlobal(
            @RequestBody FocusModeRequestDTO dto,
            Principal principal) {
        condominiumManagementService.setFocusModeForAll(principal.getName(), dto.enabled());
        return ResponseEntity.noContent().build();
    }
}