package com.jonathanspereira.condoflow.auth.service;

import com.jonathanspereira.condoflow.auth.dto.AuthRequestDTO;
import com.jonathanspereira.condoflow.auth.dto.AuthResponseDTO;
import com.jonathanspereira.condoflow.common.exception.BusinessException;
import com.jonathanspereira.condoflow.user.entity.User;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
import com.jonathanspereira.condoflow.auth.entity.PasswordResetToken;
import com.jonathanspereira.condoflow.auth.repository.PasswordResetTokenRepository;
import com.jonathanspereira.condoflow.common.email.service.EmailService;

import com.jonathanspereira.condoflow.auth.dto.RegisterSindicoRequestDTO;
import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.entity.CondominiumRole;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRoleRepository;
import com.jonathanspereira.condoflow.user.entity.Role;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    private final CondominiumRepository condominiumRepository;
    private final CondominiumRoleRepository condominiumRoleRepository;


    
    @Transactional
    public AuthResponseDTO registerSindico(RegisterSindicoRequestDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()) != null) {
            throw new BusinessException("E-mail já cadastrado.");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(Role.SINDICO);
        User savedUser = userRepository.save(user);

        Condominium condominium = new Condominium();
        condominium.setName(dto.getCondominiumName());
        condominium.setCnpj(dto.getCondominiumCnpj());
        condominium.setAddress(dto.getCondominiumAddress());
        condominium.setTrialEndDate(java.time.LocalDate.now().plusDays(30));
        Condominium savedCondo = condominiumRepository.save(condominium);

        CondominiumRole role = new CondominiumRole();
        role.setCondominium(savedCondo);
        role.setUser(savedUser);
        role.setRole(Role.SINDICO);
        role.setActive(true);
        role.setFocusModeEnabled(false);
        condominiumRoleRepository.save(role);

        String token = tokenService.generateToken(savedUser);
        return new AuthResponseDTO(token, savedUser.getName(), savedUser.getEmail(), savedUser.getRole().name());
    }

    public AuthResponseDTO login(AuthRequestDTO dto) {
        if (dto.getEmail() == null || dto.getPassword() == null) {
            throw new BusinessException("E-mail e senha são obrigatórios");
        }

        String email = dto.getEmail().trim();
        User user = (User) userRepository.findByEmail(email);
        if (user == null) {
            user = (User) userRepository.findByEmail(email.toLowerCase());
        }

        if (user == null || !passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BusinessException("Credenciais inválidas");
        }

        String token = tokenService.generateToken(user);
        return new AuthResponseDTO(token, user.getName(), user.getEmail(), user.getRole().name());
    }

    public void forgotPassword(String email) {
        if (email == null || email.isBlank()) {
            throw new BusinessException("E-mail é obrigatório");
        }
        String cleanEmail = email.trim();
        User user = (User) userRepository.findByEmail(cleanEmail);
        if (user == null) {
            user = (User) userRepository.findByEmail(cleanEmail.toLowerCase());
        }
        if (user == null) {
            throw new BusinessException("Se o e-mail estiver cadastrado, um link será enviado.");
        }

        // Deleta tokens antigos
        passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user, LocalDateTime.now().plusHours(2));
        passwordResetTokenRepository.save(resetToken);

        // Envia o e-mail de recuperação de senha
        emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), token);
    }


    public void firstAccess(String email) {
        if (email == null || email.isBlank()) {
            throw new BusinessException("E-mail é obrigatório");
        }
        String cleanEmail = email.trim();
        User user = (User) userRepository.findByEmail(cleanEmail);
        if (user == null) {
            user = (User) userRepository.findByEmail(cleanEmail.toLowerCase());
        }
        if (user == null) {
            throw new BusinessException("Se o e-mail estiver cadastrado, um link será enviado.");
        }

        passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user, LocalDateTime.now().plusHours(24));
        passwordResetTokenRepository.save(resetToken);

        emailService.sendFirstAccessEmail(user.getEmail(), user.getName(), token);
    }

    public void resetPassword(String token, String newPassword) {

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException("Token inválido ou inexistente."));

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BusinessException("O link de recuperação expirou. Solicite um novo.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);
    }
}