package com.jonathanspereira.condoflow.log.controller;

import com.jonathanspereira.condoflow.log.dto.SystemLogResponseDTO;
import com.jonathanspereira.condoflow.log.repository.SystemLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/logs")
@RequiredArgsConstructor
@Tag(name = "System Logs", description = "Endpoints para gerenciamento e auditoria de logs (Apenas Super Admin)")
@SecurityRequirement(name = "bearerAuth")
public class SystemLogController {

    private final SystemLogRepository repository;

    @Operation(summary = "Busca logs do sistema", description = "Retorna os logs ordenados pela data mais recente, opcionalmente filtrados por tipo.")
    @GetMapping
    @PreAuthorize("hasAuthority('SUPER_ADMIN')")
    public ResponseEntity<List<SystemLogResponseDTO>> getLogs(@RequestParam(required = false) String type) {
        if (type != null && !type.isBlank()) {
            return ResponseEntity.ok(repository.findByTypeOrderByCreatedAtDesc(type)
                    .stream().map(SystemLogResponseDTO::new).collect(Collectors.toList()));
        }
        return ResponseEntity.ok(repository.findAllByOrderByCreatedAtDesc()
                .stream().map(SystemLogResponseDTO::new).collect(Collectors.toList()));
    }
}
