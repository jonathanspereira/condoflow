package com.jonathanspereira.condoflow.occurrence.service;

import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import com.jonathanspereira.condoflow.occurrence.dto.OccurrenceRequestDTO;
import com.jonathanspereira.condoflow.occurrence.dto.OccurrenceResponseDTO;
import com.jonathanspereira.condoflow.occurrence.entity.Occurrence;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceStatus;
import com.jonathanspereira.condoflow.occurrence.repository.OccurrenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class OccurrenceService {

    private final OccurrenceRepository occurrenceRepository;
    private final CondominiumRepository condominiumRepository;

    public OccurrenceResponseDTO create(OccurrenceRequestDTO dto) {
        // 1. Valida se o condomínio existe
        Condominium condominium = condominiumRepository.findById(dto.condominiumId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Condomínio não encontrado."));

        // 2. Cria a entidade
        Occurrence occurrence = new Occurrence();
        occurrence.setTitle(dto.title());
        occurrence.setDescription(dto.description());
        occurrence.setCondominium(condominium);
        occurrence.setStatus(OccurrenceStatus.OPEN);
        // O protocolo será gerado automaticamente pelo @PrePersist na entidade

        // 3. Salva no banco
        Occurrence saved = occurrenceRepository.save(occurrence);

        // 4. Retorna os dados mapeados para o frontend (incluindo o protocolo gerado)
        return new OccurrenceResponseDTO(saved);
    }
}