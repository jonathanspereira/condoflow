package com.jonathanspereira.condoflow.condominium.service;

import com.jonathanspereira.condoflow.condominium.dto.CondominiumRequestDTO;
import com.jonathanspereira.condoflow.condominium.dto.CondominiumResponseDTO;
import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CondominiumService {

    private final CondominiumRepository condominiumRepository;

    public CondominiumResponseDTO create(CondominiumRequestDTO requestDTO) {
        Condominium condominium = new Condominium();

        condominium.setName(requestDTO.getName());
        condominium.setCnpj(requestDTO.getCnpj());
        condominium.setAddress(requestDTO.getAddress());
        condominium.setCreatedAt(LocalDateTime.now(ZoneId.systemDefault()));

        Condominium savedCondominium = condominiumRepository.save(condominium);
        return new CondominiumResponseDTO(savedCondominium);
    }

    public List<CondominiumResponseDTO> findAll() {
        return condominiumRepository.findAll().stream()
                .map(CondominiumResponseDTO::new)
                .collect(Collectors.toList());
    }

    public CondominiumResponseDTO findById(Long id) {
        Condominium condominium = condominiumRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Condomínio não encontrado"));
        return new CondominiumResponseDTO(condominium);
    }

    public CondominiumResponseDTO update(Long id, CondominiumRequestDTO dto) {
        Condominium condominium = condominiumRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Condomínio não encontrado"));

        condominium.setName(dto.getName());
        condominium.setCnpj(dto.getCnpj());
        condominium.setAddress(dto.getAddress());

        Condominium updatedCondominium = condominiumRepository.save(condominium);
        return new CondominiumResponseDTO(updatedCondominium);
    }

    public void delete(Long id) {
        if (!condominiumRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Condomínio não encontrado");
        }
        condominiumRepository.deleteById(id);
    }
}