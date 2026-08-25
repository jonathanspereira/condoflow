package com.jonathanspereira.condoflow.occurrence.service;

import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRoleRepository;
import com.jonathanspereira.condoflow.condominium.entity.CondominiumRole;
import com.jonathanspereira.condoflow.notification.service.NotificationService;
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
import com.jonathanspereira.condoflow.user.entity.Role;
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

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class OccurrenceService {

    private final OccurrenceRepository occurrenceRepository;
    private final OccurrenceMessageRepository occurrenceMessageRepository;
    private final OccurrenceAttachmentRepository occurrenceAttachmentRepository;
    private final CondominiumRepository condominiumRepository;
    private final UserRepository userRepository;
    private final UnitRepository unitRepository;
    private final com.jonathanspereira.condoflow.common.email.service.EmailService emailService;
    private final NotificationService notificationService;
    private final CondominiumRoleRepository condominiumRoleRepository;

    public OccurrenceResponseDTO create(String userEmail, OccurrenceRequestDTO dto) {
        User reporter = getUserByEmail(userEmail);

        Unit unit = null;
        if (dto.unitId() != null) {
            unit = unitRepository.findById(dto.unitId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unidade informada não encontrada."));
        } else {
            unit = unitRepository.findAllByOwnerId(reporter.getId()).stream().findFirst()
                    .or(() -> unitRepository.findAllByTenantId(reporter.getId()).stream().findFirst())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Você não possui uma unidade vinculada para abrir um relato."));
        }

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
        occurrence.setRelatedUnits(dto.relatedUnits());

        Occurrence saved = occurrenceRepository.save(occurrence);

        // Notificar Síndico(s) do Condomínio via Sininho e E-mail
        List<User> sindicos = condominiumRoleRepository.findByCondominiumId(condominium.getId()).stream().map(CondominiumRole::getUser).collect(Collectors.toList());
        for (User sindico : sindicos) {
            notificationService.createNotification(
                    sindico,
                    "Nova Ocorrência Recebida",
                    "Nova ocorrência #" + saved.getProtocol() + " (" + saved.getTitle() + ") foi registrada.",
                    saved.getProtocol()
            );
            if (sindico.getEmail() != null) {
                emailService.sendOccurrenceUpdateNotification(
                        sindico.getEmail(),
                        sindico.getName(),
                        saved.getProtocol(),
                        saved.getTitle(),
                        "OPEN",
                        "Uma nova ocorrência foi registrada por " + reporter.getName() + " (" + unit.getUnit() + ")."
                );
            }
        }

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
        occurrence.setRelatedUnits(dto.relatedUnits());

        Occurrence saved = occurrenceRepository.save(occurrence);

        // Notificar Síndico(s) do Condomínio via Sininho e E-mail
        List<User> sindicos = condominiumRoleRepository.findByCondominiumId(condominium.getId()).stream().map(CondominiumRole::getUser).collect(Collectors.toList());
        for (User sindico : sindicos) {
            notificationService.createNotification(
                    sindico,
                    "Nova Ocorrência Anônima",
                    "Nova ocorrência anônima #" + saved.getProtocol() + " (" + saved.getTitle() + ") foi recebida.",
                    saved.getProtocol()
            );
            if (sindico.getEmail() != null) {
                emailService.sendOccurrenceUpdateNotification(
                        sindico.getEmail(),
                        sindico.getName(),
                        saved.getProtocol(),
                        saved.getTitle(),
                        "OPEN",
                        "Uma nova ocorrência anônima foi registrada no condomínio."
                );
            }
        }

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

        boolean statusChanged = dto.status() != null && occurrence.getStatus() != dto.status();
        
        if (dto.status() != null) {
            occurrence.setStatus(dto.status());
        }
        
        boolean hasMessage = dto.response() != null && !dto.response().isBlank();
        if (hasMessage) {
            occurrence.setResponse(dto.response());
        }

        Occurrence saved = occurrenceRepository.save(occurrence);

        // Se tiver uma mensagem, salva ela no histórico da ocorrência
        if (hasMessage) {
            // Tentamos pegar o usuário atual para definir como remetente da mensagem.
            // Para ser simples e não quebrar a estrutura, vamos buscar pelo SecurityContextHolder se possível,
            // ou deixar null/pegar o síndico principal se precisar. Como o Controller passa o id e dto, não temos o email aqui facilmente.
            // Pelo escopo da tarefa: só de salvar `response` já fica lá. Mas para o chat funcionar, precisamos criar um `OccurrenceMessage`.
            // Uma maneira fácil é apenas criar a mensagem sem remetente explícito, mas indicando que é da administração.
            
            OccurrenceMessage message = new OccurrenceMessage();
            message.setOccurrence(saved);
            message.setContent(dto.response());
            // sender is null for now since we do not have the user context in update
            // Não vamos definir setSender(User) para evitar dependência do SecurityContext aqui
            
            occurrenceMessageRepository.save(message);
        }

        // Resolve recipiente (Morador)
        User recipientUser = saved.getReportedBy();
        if (recipientUser == null && saved.getUnit() != null) {
            if (saved.getUnit().isRented() && saved.getUnit().getTenant() != null) {
                recipientUser = saved.getUnit().getTenant();
            } else if (saved.getUnit().getOwner() != null) {
                recipientUser = saved.getUnit().getOwner();
            }
        }

        if (recipientUser != null && (statusChanged || hasMessage)) {
            // Notificação no Sininho
            notificationService.createNotification(
                    recipientUser,
                    "Ocorrência Atualizada",
                    "A ocorrência #" + saved.getProtocol() + " teve atualizações (status/mensagem).",
                    saved.getProtocol()
            );

            // Notificação por E-mail (Apenas UM e-mail combinando status e mensagem)
            if (recipientUser.getEmail() != null) {
                emailService.sendOccurrenceUpdateNotification(
                        recipientUser.getEmail(),
                        recipientUser.getName(),
                        saved.getProtocol(),
                        saved.getTitle(),
                        saved.getStatus() != null ? saved.getStatus().name() : "ATUALIZADO",
                        hasMessage ? dto.response() : null
                );
            }
        }

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

        OccurrenceMessage savedMessage = occurrenceMessageRepository.save(message);
        if (occurrence.getMessages() != null && !occurrence.getMessages().contains(savedMessage)) {
            occurrence.getMessages().add(savedMessage);
        }

        // Determinar recipiente (se o remetente for síndico, o recipiente é o morador, e vice-versa)
        User recipientUser = occurrence.getReportedBy();
        if (recipientUser == null && occurrence.getUnit() != null) {
            if (occurrence.getUnit().isRented() && occurrence.getUnit().getTenant() != null) {
                recipientUser = occurrence.getUnit().getTenant();
            } else if (occurrence.getUnit().getOwner() != null) {
                recipientUser = occurrence.getUnit().getOwner();
            }
        }

        // Se o remetente for o próprio morador, notificar o síndico
        if (recipientUser != null && sender.getId().equals(recipientUser.getId())) {
            List<User> sindicos = userRepository.findByCondominiumIdAndRole(occurrence.getCondominium().getId(), Role.SINDICO);
            for (User sindico : sindicos) {
                notificationService.createNotification(
                        sindico,
                        "Nova Resposta na Ocorrência",
                        sender.getName() + " enviou uma nova resposta na ocorrência #" + occurrence.getProtocol() + ".",
                        occurrence.getProtocol()
                );
            }
        } else if (recipientUser != null && !sender.getId().equals(recipientUser.getId())) {
            // Se o remetente for o síndico, notificar o morador
            notificationService.createNotification(
                    recipientUser,
                    "Nova Resposta do Síndico",
                    sender.getName() + " respondeu à ocorrência #" + occurrence.getProtocol() + ".",
                    occurrence.getProtocol()
            );

            if (recipientUser.getEmail() != null) {
                emailService.sendOccurrenceUpdateNotification(
                        recipientUser.getEmail(),
                        recipientUser.getName(),
                        occurrence.getProtocol(),
                        occurrence.getTitle(),
                        occurrence.getStatus() != null ? occurrence.getStatus().name() : "NOVA MENSAGEM",
                        dto.content()
                );
            }
        }

        return new OccurrenceResponseDTO(occurrence);
    }

    public OccurrenceResponseDTO addAttachment(Long id, MultipartFile file, String userEmail) {
        Occurrence occurrence = occurrenceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrência não encontrada."));

        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo vazio.");
        }

        try {
            OccurrenceAttachment attachment = new OccurrenceAttachment();
            attachment.setOccurrence(occurrence);
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFileType(file.getContentType());
            attachment.setFileData(file.getBytes());

            OccurrenceAttachment savedAttachment = occurrenceAttachmentRepository.save(attachment);
            if (occurrence.getAttachments() != null && !occurrence.getAttachments().contains(savedAttachment)) {
                occurrence.getAttachments().add(savedAttachment);
            }

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

    private String translateStatus(OccurrenceStatus status) {
        if (status == null) return "Atualizado";
        return switch (status) {
            case OPEN -> "Aberto";
            case IN_PROGRESS -> "Em Andamento";
            case RESOLVED -> "Resolvido";
            case CLOSED -> "Concluído";
        };
    }

    private User getUserByEmail(String email) {
        UserDetails userDetails = userRepository.findByEmail(email);
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado.");
        }
        return (User) userDetails;
    }
}