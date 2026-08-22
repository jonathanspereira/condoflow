import re

with open("backend/src/main/java/com/jonathanspereira/condoflow/occurrence/service/OccurrenceService.java", "r") as f:
    content = f.read()

# For create()
create_notify = """
        // Notificar Síndico(s) do Condomínio via Sininho e E-mail
        List<User> sindicos = userRepository.findByCondominiumIdAndRole(condominium.getId(), Role.SINDICO);
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
"""
content = re.sub(
    r'// Notificar Síndico\(s\) do Condomínio via Sininho\s+List<User> sindicos = userRepository\.findByCondominiumIdAndRole.*?\}\n',
    create_notify.lstrip(),
    content,
    count=1,
    flags=re.DOTALL
)

# For createAnonymous()
create_anon_notify = """
        // Notificar Síndico(s) do Condomínio via Sininho e E-mail
        List<User> sindicos = userRepository.findByCondominiumIdAndRole(condominium.getId(), Role.SINDICO);
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
"""
content = re.sub(
    r'// Notificar Síndico\(s\) do Condomínio via Sininho\s+List<User> sindicos = userRepository\.findByCondominiumIdAndRole.*?\}\n',
    create_anon_notify.lstrip(),
    content,
    count=1,
    flags=re.DOTALL
)

# For update() combined with message logic
# We need to change the behavior of update() to also add a message if response() is not blank.
update_new = """
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
            message.setSenderName("Administração"); // Generic sender for now
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
"""

content = re.sub(
    r'public OccurrenceResponseDTO update\(Long id, OccurrenceUpdateDTO dto\).*?return new OccurrenceResponseDTO\(saved\);\n    }',
    update_new.strip(),
    content,
    flags=re.DOTALL
)

with open("backend/src/main/java/com/jonathanspereira/condoflow/occurrence/service/OccurrenceService.java", "w") as f:
    f.write(content)
