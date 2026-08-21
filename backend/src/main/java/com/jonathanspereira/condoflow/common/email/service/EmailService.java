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
        String subject = "CondoFlow - Cadastro / Criação de Senha de Acesso";

        String htmlContent = """
            <div style='font-family: Arial, sans-serif; color: #333; max-w-600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>
                <h2 style='color: #0f172a;'>Cadastro de Senha de Acesso</h2>
                <p>Olá, <strong>%s</strong>!</p>
                <p>Foi solicitada a criação ou redefinição da sua senha de acesso no <strong>CondoFlow</strong>.</p>
                <p>Clique no botão abaixo para definir sua nova senha de acesso:</p>
                <div style='margin: 25px 0;'>
                    <a href='%s' style='background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Cadastrar Minha Senha</a>
                </div>
                <p style='font-size: 12px; color: #64748b;'>Caso não tenha feito essa solicitação, você pode ignorar este e-mail com segurança.</p>
                <hr style='border: none; border-top: 1px solid #eeeeee; margin-top: 30px;' />
                <p style='font-size: 11px; color: #94a3b8;'>CondoFlow - Gestão Inteligente de Condomínios</p>
            </div>
            """.formatted(userName != null ? userName : "Morador", resetLink);

        sendEmail(toEmail, subject, htmlContent, resetLink);
    }

    /**
     * Envia e-mail de primeiro acesso com credenciais temporárias ou convite.
     */
    @Async
    public void sendFirstAccessEmail(String toEmail, String userName, String initialPassword) {
        String loginLink = frontendUrl + "/login";
        String subject = "Bem-vindo ao CondoFlow - Seu Primeiro Acesso";

        String htmlContent = """
            <div style='font-family: Arial, sans-serif; color: #333; max-w-600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>
                <h2 style='color: #10b981;'>Bem-vindo ao CondoFlow!</h2>
                <p>Olá, <strong>%s</strong>!</p>
                <p>Sua conta foi criada no sistema CondoFlow pelo síndico/administrador do seu condomínio.</p>
                <div style='background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;'>
                    <p style='margin: 0;'><strong>E-mail:</strong> %s</p>
                    <p style='margin: 5px 0 0 0;'><strong>Senha Temporária:</strong> <code style='background: #e2e8f0; padding: 2px 6px; border-radius: 4px;'>%s</code></p>
                </div>
                <p>Acesse o sistema no botão abaixo e recomendamos alterar sua senha no primeiro acesso:</p>
                <div style='margin: 25px 0;'>
                    <a href='%s' style='background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Acessar o CondoFlow</a>
                </div>
                <hr style='border: none; border-top: 1px solid #eeeeee; margin-top: 30px;' />
                <p style='font-size: 11px; color: #94a3b8;'>CondoFlow - Plataforma de Comunicação Condominial</p>
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
        String subject = "CondoFlow - Atualização na Ocorrência #" + protocol;

        String htmlContent = """
            <div style='font-family: Arial, sans-serif; color: #333; max-w-600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>
                <h3 style='color: #0f172a;'>Atualização de Ocorrência</h3>
                <p>Olá, <strong>%s</strong>!</p>
                <p>Houve uma atualização no seu relato <strong>#%s - %s</strong>.</p>
                <div style='background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;'>
                    <p style='margin: 0;'><strong>Novo Status:</strong> <span style='color: #2563eb; font-weight: bold;'>%s</span></p>
                    %s
                </div>
                <div style='margin: 25px 0;'>
                    <a href='%s' style='background-color: #0f172a; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Ver Detalhes</a>
                </div>
            </div>
            """.formatted(
                userName != null ? userName : "Morador",
                protocol,
                title,
                newStatus,
                (message != null && !message.isBlank()) ? "<p style='margin: 10px 0 0 0;'><strong>Mensagem:</strong> " + message + "</p>" : "",
                occurrenceLink
        );

        sendEmail(toEmail, subject, htmlContent, "Protocolo: " + protocol + " | Status: " + newStatus);
    }

    /**
     * Método central de envio via JavaMailSender com fallback gracioso para log de console.
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
            System.out.println(">>> [SIMULAÇÃO DE EMAIL CONDOFLOW] <<<");
            System.out.println("PARA: " + toEmail);
            System.out.println("ASSUNTO: " + subject);
            System.out.println("CONTEÚDO/INFO: " + fallbackInfo);
            System.out.println("==================================================================");
        }
    }
}
