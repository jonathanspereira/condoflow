package com.jonathanspereira.condoflow.common.email.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.mail.username:noreply@condoflow.com}")
    private String fromEmail;

    /**
     * Envia e-mail para cadastrar ou redefinir a senha de acesso.
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String userName, String token) {
        String resetLink = frontendUrl + "/redefinir-senha?token=" + token;
        String subject = "CondoFlow - Criar Senha de Acesso";

        String htmlContent = """
            <div style='background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px;'>
                <div style='max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;'>
                    <!-- Header Verde -->
                    <div style='background: linear-gradient(135deg, #059669, #10b981); padding: 28px 32px; text-align: left;'>
                        <h1 style='color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;'>CondoFlow</h1>
                        <p style='color: #d1fae5; margin: 4px 0 0 0; font-size: 13px; font-weight: 500;'>Plataforma de Gestão Condominial</p>
                    </div>
                    <!-- Corpo -->
                    <div style='padding: 32px; color: #334155;'>
                        <h2 style='color: #0f172a; font-size: 18px; margin-top: 0; margin-bottom: 16px;'>Criar Senha de Acesso</h2>
                        <p style='font-size: 15px; line-height: 1.6; margin-bottom: 16px;'>Olá, <strong>%s</strong>!</p>
                        <p style='font-size: 15px; line-height: 1.6; margin-bottom: 24px;'>Você recebeu este e-mail para cadastrar e definir sua senha de acesso ao <strong>CondoFlow</strong>.</p>
                        <!-- Botão CTA -->
                        <div style='margin: 32px 0; text-align: center;'>
                            <a href='%s' style='background-color: #059669; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 2px 6px rgba(5, 150, 105, 0.25);'>Cadastrar Minha Senha</a>
                        </div>
                        <p style='font-size: 13px; color: #64748b; line-height: 1.5; margin-top: 24px;'>Caso não tenha feito essa solicitação, você pode ignorar este e-mail com segurança.</p>
                    </div>
                    <!-- Rodapé -->
                    <div style='background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;'>
                        <p style='margin: 0; font-size: 12px; color: #94a3b8;'>CondoFlow • Gestão Inteligente de Condomínios</p>
                    </div>
                </div>
            </div>
            """.formatted(userName != null ? userName : "Morador", resetLink);

        sendEmail(toEmail, subject, htmlContent, resetLink);
    }

    /**
     * Envia e-mail de primeiro acesso com credenciais temporárias ou convite.
     */
    @Async
    public void sendFirstAccessEmail(String toEmail, String userName, String initialPassword) {
        String loginLink = frontendUrl + "/morador/login";
        String subject = "Bem-vindo ao CondoFlow - Seu Primeiro Acesso";

        String htmlContent = """
            <div style='background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px;'>
                <div style='max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;'>
                    <!-- Header Verde -->
                    <div style='background: linear-gradient(135deg, #059669, #10b981); padding: 28px 32px; text-align: left;'>
                        <h1 style='color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;'>CondoFlow</h1>
                        <p style='color: #d1fae5; margin: 4px 0 0 0; font-size: 13px; font-weight: 500;'>Bem-vindo ao seu novo portal de condomínio</p>
                    </div>
                    <!-- Corpo -->
                    <div style='padding: 32px; color: #334155;'>
                        <h2 style='color: #0f172a; font-size: 18px; margin-top: 0; margin-bottom: 16px;'>Seu Primeiro Acesso</h2>
                        <p style='font-size: 15px; line-height: 1.6; margin-bottom: 16px;'>Olá, <strong>%s</strong>!</p>
                        <p style='font-size: 15px; line-height: 1.6; margin-bottom: 20px;'>Sua conta foi criada no sistema CondoFlow pelo síndico ou administrador do seu condomínio.</p>
                        <!-- Box Credenciais -->
                        <div style='background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 18px 20px; border-radius: 8px; margin: 20px 0;'>
                            <p style='margin: 0 0 8px 0; font-size: 14px; color: #065f46;'><strong>E-mail:</strong> %s</p>
                            <p style='margin: 0; font-size: 14px; color: #065f46;'><strong>Senha Temporária:</strong> <code style='background: #ffffff; padding: 3px 8px; border-radius: 4px; border: 1px solid #6ee7b7; font-family: monospace; font-weight: bold; color: #047857;'>%s</code></p>
                        </div>
                        <p style='font-size: 14px; color: #475569; line-height: 1.5;'>Acesse o sistema no botão abaixo e recomendamos alterar sua senha no primeiro acesso:</p>
                        <!-- Botão CTA -->
                        <div style='margin: 28px 0; text-align: center;'>
                            <a href='%s' style='background-color: #059669; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 2px 6px rgba(5, 150, 105, 0.25);'>Acessar o CondoFlow</a>
                        </div>
                    </div>
                    <!-- Rodapé -->
                    <div style='background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;'>
                        <p style='margin: 0; font-size: 12px; color: #94a3b8;'>CondoFlow • Plataforma de Comunicação Condominial</p>
                    </div>
                </div>
            </div>
            """.formatted(userName != null ? userName : "Morador", toEmail, initialPassword, loginLink);

        sendEmail(toEmail, subject, htmlContent, "Login: " + toEmail + " | Senha: " + initialPassword);
    }

    /**
     * Envia e-mail de notificação quando o status da ocorrência muda ou recebe resposta.
     */
    @Async
    public void sendOccurrenceUpdateNotification(String toEmail, String userName, String protocol, String title, String newStatus, String message) {
        String occurrenceLink = frontendUrl + "/morador/minhas-ocorrencias/" + protocol;

        boolean isFinalized = "RESOLVED".equalsIgnoreCase(newStatus) || "CLOSED".equalsIgnoreCase(newStatus);
        
        String subject;
        String headerTitle;
        String headerSub;
        String statusLabel;
        String statusBgColor;

        if (isFinalized) {
            subject = "CondoFlow - Ocorrência Finalizada #" + protocol;
            headerTitle = "Ocorrência Finalizada";
            headerSub = "Sua ocorrência foi concluída pela administração";
            statusLabel = "RESOLVED".equalsIgnoreCase(newStatus) ? "RESOLVIDO" : "CONCLUÍDO";
            statusBgColor = "#059669"; // Verde
        } else if (message != null && !message.isBlank()) {
            subject = "CondoFlow - Nova Resposta na Ocorrência #" + protocol;
            headerTitle = "Nova Resposta do Síndico";
            headerSub = "O síndico enviou uma mensagem sobre o seu relato";
            statusLabel = translateStatus(newStatus);
            statusBgColor = "#2563eb"; // Azul
        } else {
            subject = "CondoFlow - Atualização na Ocorrência #" + protocol;
            headerTitle = "Atualização de Ocorrência";
            headerSub = "Houve alteração no status do seu relato";
            statusLabel = translateStatus(newStatus);
            statusBgColor = "#d97706"; // Amber
        }

        String htmlContent = """
            <div style='background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px;'>
                <div style='max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;'>
                    <!-- Header Verde -->
                    <div style='background: linear-gradient(135deg, #059669, #10b981); padding: 28px 32px; text-align: left;'>
                        <h1 style='color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;'>CondoFlow</h1>
                        <p style='color: #d1fae5; margin: 4px 0 0 0; font-size: 13px; font-weight: 500;'>%s</p>
                    </div>
                    <!-- Corpo -->
                    <div style='padding: 32px; color: #334155;'>
                        <h2 style='color: #0f172a; font-size: 18px; margin-top: 0; margin-bottom: 16px;'>%s</h2>
                        <p style='font-size: 15px; line-height: 1.6; margin-bottom: 16px;'>Olá, <strong>%s</strong>!</p>
                        <p style='font-size: 15px; line-height: 1.6; margin-bottom: 20px;'>Houve uma atualização na sua ocorrência <strong>#%s - %s</strong>.</p>
                        <!-- Box Info -->
                        <div style='background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 18px 20px; border-radius: 8px; margin: 20px 0;'>
                            <p style='margin: 0; font-size: 14px; color: #065f46;'><strong>Status Atual:</strong> <span style='background-color: %s; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;'>%s</span></p>
                            %s
                        </div>
                        <p style='font-size: 14px; color: #475569; line-height: 1.5;'>Acompanhe o histórico completo e interaja com o síndico pelo sistema:</p>
                        <!-- Botão CTA -->
                        <div style='margin: 28px 0; text-align: center;'>
                            <a href='%s' style='background-color: #059669; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 2px 6px rgba(5, 150, 105, 0.25);'>Acessar Ocorrência</a>
                        </div>
                    </div>
                    <!-- Rodapé -->
                    <div style='background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;'>
                        <p style='margin: 0; font-size: 12px; color: #94a3b8;'>CondoFlow • Gestão Inteligente de Condomínios</p>
                    </div>
                </div>
            </div>
            """.formatted(
                headerSub,
                headerTitle,
                userName != null ? userName : "Morador",
                protocol,
                title,
                statusBgColor,
                statusLabel,
                (message != null && !message.isBlank()) ? "<div style='margin-top: 12px; padding-top: 12px; border-top: 1px solid #a7f3d0;'><p style='margin: 0; font-size: 13px; color: #065f46;'><strong>Resposta do Síndico:</strong></p><p style='margin: 4px 0 0 0; font-size: 14px; color: #047857; font-style: italic;'>\"" + message + "\"</p></div>" : "",
                occurrenceLink
        );

        sendEmail(toEmail, subject, htmlContent, "Protocolo: " + protocol + " | Status: " + statusLabel);
    }

    private String translateStatus(String status) {
        if (status == null) return "ATUALIZADO";
        return switch (status.toUpperCase()) {
            case "OPEN" -> "ABERTO";
            case "IN_PROGRESS" -> "EM ATENDIMENTO";
            case "RESOLVED" -> "RESOLVIDO";
            case "CLOSED" -> "CONCLUÍDO";
            default -> status;
        };
    }

    /**
     * Método central de envio via JavaMailSender com fallback para log de console.
     */
    private void sendEmail(String toEmail, String subject, String htmlContent, String fallbackInfo) {
        try {
            if (fromEmail == null || fromEmail.isBlank()) {
                fromEmail = "noreply@condoflow.com";
            }

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            log.info("E-mail enviado com sucesso para: {} com o assunto: {}", toEmail, subject);
        } catch (Exception e) {
            log.warn("Servidor SMTP não configurado ou indisponível. Exibindo e-mail no LOG/Console: {}", e.getMessage());
            System.out.println("==================================================================");
            System.out.println(">>> [EMAIL CONDOFLOW] <<<");
            System.out.println("PARA: " + toEmail);
            System.out.println("ASSUNTO: " + subject);
            System.out.println("CONTEÚDO/INFO: " + fallbackInfo);
            System.out.println("==================================================================");
        }
    }
}
