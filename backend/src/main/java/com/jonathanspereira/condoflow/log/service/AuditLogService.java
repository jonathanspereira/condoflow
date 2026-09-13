package com.jonathanspereira.condoflow.log.service;

import com.jonathanspereira.condoflow.log.entity.SystemLog;
import com.jonathanspereira.condoflow.log.repository.SystemLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servico centralizado de auditoria. Registra eventos criticos do sistema
 * em tb_system_logs. Roda em transacao separada para nao afetar a transacao principal.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final SystemLogRepository systemLogRepository;

    /**
     * Tipos de log disponiveis (convenção):
     *  AUTH       - login, logout, token, redefinicao de senha
     *  USER       - criacao, edicao, exclusao de usuarios
     *  CONDOMINIO - criacao, edicao, exclusao de condominios
     *  UNIDADE    - cadastro, edicao, exclusao de unidades
     *  OCORRENCIA - criacao, atualizacao de ocorrencias
     *  EMAIL      - envios de e-mail (gerenciado pelo EmailService)
     *  PLANO      - mudancas de plano
     *  SEGURANCA  - tentativas de acesso nao autorizado, bloqueios
     */

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String type, String action, String target, String message) {
        doSave(type, action, target, message, "SUCCESS", null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logError(String type, String action, String target, String message, String errorDetail) {
        doSave(type, action, target, message, "ERROR", errorDetail);
    }

    private void doSave(String type, String action, String target, String message, String status, String details) {
        try {
            SystemLog sysLog = new SystemLog();
            sysLog.setType(type);
            sysLog.setAction(action);
            sysLog.setTarget(target);
            sysLog.setMessage(message);
            sysLog.setStatus(status);
            sysLog.setDetails(details);
            systemLogRepository.save(sysLog);
        } catch (Exception e) {
            log.error("Falha ao salvar log de auditoria [{}/{}]: {}", type, action, e.getMessage());
        }
    }
}
