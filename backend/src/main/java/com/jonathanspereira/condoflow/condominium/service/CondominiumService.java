package com.jonathanspereira.condoflow.condominium.service;

import com.jonathanspereira.condoflow.condominium.dto.CondominiumRequestDTO;
import com.jonathanspereira.condoflow.condominium.dto.CondominiumResponseDTO;
import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CondominiumService {

    private final CondominiumRepository repository;

    public CondominiumResponseDTO create(CondominiumRequestDTO dto) {
        Condominium condominium = new Condominium();
        condominium.setName(dto.name());
        condominium.setAddress(dto.address());

        Condominium saved = repository.save(condominium);
        return new CondominiumResponseDTO(saved);
    }

    public List<CondominiumResponseDTO> findAll() {
        return repository.findAll().stream()
                .map(CondominiumResponseDTO::new)
                .collect(Collectors.toList());
    }

    public CondominiumResponseDTO findById(String id) {
        Condominium condominium = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Condomínio não encontrado"));
        return new CondominiumResponseDTO(condominium);
    }

    public CondominiumResponseDTO update(String id, CondominiumRequestDTO dto) {
        Condominium condominium = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Condomínio não encontrado"));

        condominium.setName(dto.name());
        condominium.setAddress(dto.address());

        Condominium updated = repository.save(condominium);
        return new CondominiumResponseDTO(updated);
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Condomínio não encontrado");
        }
        repository.deleteById(id);
    }
}