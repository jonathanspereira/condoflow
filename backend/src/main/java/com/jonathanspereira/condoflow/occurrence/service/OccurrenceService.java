package com.jonathanspereira.condoflow.occurrence.service;

import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import com.jonathanspereira.condoflow.occurrence.dto.AnonymousOccurrenceRequestDTO;
import com.jonathanspereira.condoflow.occurrence.dto.OccurrenceRequestDTO;
import com.jonathanspereira.condoflow.occurrence.dto.OccurrenceResponseDTO;
import com.jonathanspereira.condoflow.occurrence.dto.OccurrenceUpdateDTO;
import com.jonathanspereira.condoflow.occurrence.entity.Occurrence;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceStatus;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceMessage;
import com.jonathanspereira.condoflow.occurrence.repository.OccurrenceRepository;
import com.jonathanspereira.condoflow.occurrence.repository.OccurrenceMessageRepository;
import com.jonathanspereira.condoflow.occurrence.dto.MessageRequestDTO;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceAttachment;
import com.jonathanspereira.condoflow.occurrence.repository.OccurrenceAttachmentRepository;
import com.jonathanspereira.condoflow.unit.entity.Unit;
import com.jonathanspereira.condoflow.unit.repository.UnitRepository;
import com.jonathanspereira.condoflow.user.entity.User;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OccurrenceService {

    private final OccurrenceRepository occurrenceRepository;
    private final OccurrenceMessageRepository occurrenceMessageRepository;
    private final OccurrenceAttachmentRepository occurrenceAttachmentRepository;
    private final CondominiumRepository condominiumRepository;
    private final UserRepository userRepository;
    private final UnitRepository unitRepository;

    public OccurrenceResponseDTO create(String userEmail, OccurrenceRequestDTO dto) {
        User reporter = getUserByEmail(userEmail);

        Unit unit = unitRepository.findByOwnerId(reporter.getId())
                .or(() -> unitRepository.findByTenantId(reporter.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Você não possui uma unidade vinculada para abrir um relato."));

        Condominium condominium = condominiumRepository.findById(unit.getCondominiumId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Condomínio não encontrado."));

        Occurrence occurrence = new Occurrence();
        occurrence.setTitle(dto.title());
        occurrence.setDescription(dto.description());
        occurrence.setCategory(dto.category());
        occurrence.setCondominium(condominium);
        occurrence.setUnit(unit);
        occurrence.setReportedBy(reporter);
        occurrence.setStatus(OccurrenceStatus.OPEN);

        Occurrence saved = occurrenceRepository.save(occurrence);
        return new OccurrenceResponseDTO(saved);
    }

    public OccurrenceResponseDTO createAnonymous(AnonymousOccurrenceRequestDTO dto) {
        Condominium condominium = condominiumRepository.findById(dto.condominiumId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Condomínio não encontrado com o ID informado."));

        Occurrence occurrence = new Occurrence();
        occurrence.setTitle(dto.title());
        occurrence.setDescription(dto.description());
        occurrence.setCategory(dto.category());
        occurrence.setCondominium(condominium);
        occurrence.setStatus(OccurrenceStatus.OPEN);
        // reportedBy fica null para ocorrências anônimas

        Occurrence saved = occurrenceRepository.save(occurrence);
        return new OccurrenceResponseDTO(saved);
    }

    public List<OccurrenceResponseDTO> findMine(String userEmail) {
        User reporter = getUserByEmail(userEmail);

        return occurrenceRepository.findByReportedByIdOrderByCreatedAtDesc(reporter.getId())
                .stream()
                .map(OccurrenceResponseDTO::new)
                .collect(Collectors.toList());
    }

    public OccurrenceResponseDTO findByProtocol(String protocol) {
        Occurrence occurrence = occurrenceRepository.findByProtocol(protocol)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Ocorrência não encontrada para o protocolo informado."));

        return new OccurrenceResponseDTO(occurrence);
    }

    public List<OccurrenceResponseDTO> findByCondominium(Long condominiumId) {
        return occurrenceRepository.findByCondominiumIdOrderByCreatedAtDesc(condominiumId)
                .stream()
                .map(OccurrenceResponseDTO::new)
                .collect(Collectors.toList());
    }

    public OccurrenceResponseDTO update(Long id, OccurrenceUpdateDTO dto) {
        Occurrence occurrence = occurrenceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrência não encontrada."));

        if (dto.status() != null) {
            occurrence.setStatus(dto.status());
        }
        if (dto.response() != null) {
            occurrence.setResponse(dto.response());
        }

        Occurrence saved = occurrenceRepository.save(occurrence);
        return new OccurrenceResponseDTO(saved);
    }

    public OccurrenceResponseDTO addMessage(Long id, MessageRequestDTO dto, String userEmail) {
        Occurrence occurrence = occurrenceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrência não encontrada."));

        User sender = getUserByEmail(userEmail);

        OccurrenceMessage message = new OccurrenceMessage();
        message.setOccurrence(occurrence);
        message.setSender(sender);
        message.setContent(dto.content());

        occurrenceMessageRepository.save(message);

        // Fetch again or simply add to list, since it's lazy we might need to reload or just return DTO directly
        // Let's reload to get everything correctly mapped
        occurrence = occurrenceRepository.findById(id).orElse(occurrence);

        return new OccurrenceResponseDTO(occurrence);
    }

    public OccurrenceResponseDTO addAttachment(Long id, MultipartFile file, String userEmail) {
        Occurrence occurrence = occurrenceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrência não encontrada."));

        // Simplificação: apenas permitindo que participantes ou admin subam arquivo
        // Pode ser aprimorado com roles futuramente
        // User uploader = getUserByEmail(userEmail);

        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo vazio.");
        }

        try {
            OccurrenceAttachment attachment = new OccurrenceAttachment();
            attachment.setOccurrence(occurrence);
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFileType(file.getContentType());
            attachment.setFileData(file.getBytes());

            occurrenceAttachmentRepository.save(attachment);

            occurrence = occurrenceRepository.findById(id).orElse(occurrence);
            return new OccurrenceResponseDTO(occurrence);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao processar o arquivo.");
        }
    }

    public OccurrenceAttachment getAttachment(Long id, Long attachmentId) {
        Occurrence occurrence = occurrenceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrência não encontrada."));

        return occurrenceAttachmentRepository.findById(attachmentId)
                .filter(att -> att.getOccurrence().getId().equals(occurrence.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Anexo não encontrado."));
    }

    private User getUserByEmail(String email) {
        UserDetails userDetails = userRepository.findByEmail(email);
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado.");
        }
        return (User) userDetails;
    }
}