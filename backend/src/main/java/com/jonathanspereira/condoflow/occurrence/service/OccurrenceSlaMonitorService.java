package com.jonathanspereira.condoflow.occurrence.service;

import com.jonathanspereira.condoflow.common.email.service.EmailService;
import com.jonathanspereira.condoflow.condominium.entity.CondominiumRole;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRoleRepository;
import com.jonathanspereira.condoflow.occurrence.entity.Occurrence;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceStatus;
import com.jonathanspereira.condoflow.occurrence.repository.OccurrenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OccurrenceSlaMonitorService {

    private final OccurrenceRepository occurrenceRepository;
    private final CondominiumRoleRepository condominiumRoleRepository;
    private final EmailService emailService;

    // SLA constants in hours
    private static final int SLA_FIRST_RESPONSE_HOURS = 48;
    private static final int SLA_RESOLUTION_HOURS = 72;

    @Scheduled(cron = "0 0 * * * *") // Runs every hour at minute 0
    @Transactional
    public void monitorSla() {
        log.info("Iniciando monitoramento de SLA de Ocorrências...");
        checkFirstResponseSla();
        checkResolutionSla();
        log.info("Monitoramento de SLA concluído.");
    }

    private void checkFirstResponseSla() {
        LocalDateTime deadlineDate = LocalDateTime.now().minusHours(SLA_FIRST_RESPONSE_HOURS);
        
        List<Occurrence> breachedFirstResponse = occurrenceRepository
                .findByStatusAndCreatedAtBeforeAndSlaFirstResponseBreachedFalse(OccurrenceStatus.OPEN, deadlineDate);

        for (Occurrence occurrence : breachedFirstResponse) {
            sendSlaAlert(occurrence, "Aberto -> Em Andamento", String.valueOf(SLA_FIRST_RESPONSE_HOURS));
            occurrence.setSlaFirstResponseBreached(true);
            occurrenceRepository.save(occurrence);
            log.info("SLA de primeira resposta violado para a ocorrência: {}", occurrence.getProtocol());
        }
    }

    private void checkResolutionSla() {
        LocalDateTime deadlineDate = LocalDateTime.now().minusHours(SLA_RESOLUTION_HOURS);
        
        List<Occurrence> breachedResolution = occurrenceRepository
                .findByStatusAndInProgressAtBeforeAndSlaResolutionBreachedFalse(OccurrenceStatus.IN_PROGRESS, deadlineDate);

        for (Occurrence occurrence : breachedResolution) {
            sendSlaAlert(occurrence, "Em Andamento -> Resolvido", String.valueOf(SLA_RESOLUTION_HOURS));
            occurrence.setSlaResolutionBreached(true);
            occurrenceRepository.save(occurrence);
            log.info("SLA de resolução violado para a ocorrência: {}", occurrence.getProtocol());
        }
    }

    private void sendSlaAlert(Occurrence occurrence, String phase, String hours) {
        if (occurrence.getCondominium() == null) return;

        Optional<CondominiumRole> sindicoRole = condominiumRoleRepository
                .findByCondominiumIdAndRole(occurrence.getCondominium().getId(), "SINDICO");

        if (sindicoRole.isPresent() && sindicoRole.get().getUser() != null) {
            String toEmail = sindicoRole.get().getUser().getEmail();
            String sindicoName = sindicoRole.get().getUser().getName();

            if (toEmail != null) {
                emailService.sendSlaBreachEmail(
                        toEmail,
                        sindicoName,
                        occurrence.getProtocol(),
                        occurrence.getTitle(),
                        phase,
                        hours
                );
            }
        }
    }
}
