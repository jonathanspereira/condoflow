package com.jonathanspereira.condoflow.auth.service;

import com.jonathanspereira.condoflow.auth.dto.AuthRequestDTO;
import com.jonathanspereira.condoflow.auth.dto.AuthResponseDTO;
import com.jonathanspereira.condoflow.auth.entity.PasswordResetToken;
import com.jonathanspereira.condoflow.auth.repository.PasswordResetTokenRepository;
import com.jonathanspereira.condoflow.common.exception.BusinessException;
import com.jonathanspereira.condoflow.user.entity.Role;
import com.jonathanspereira.condoflow.user.entity.User;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private TokenService tokenService;
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @InjectMocks
    private AuthService authService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId("1");
        mockUser.setName("Test User");
        mockUser.setEmail("test@email.com");
        mockUser.setPassword("encoded_password");
        mockUser.setRole(Role.TENANT);
    }

    @Test
    void login_WithValidCredentials_ShouldReturnAuthResponse() {
        AuthRequestDTO request = new AuthRequestDTO();
        request.setEmail("test@email.com");
        request.setPassword("password");

        when(userRepository.findByEmail("test@email.com")).thenReturn(mockUser);
        when(passwordEncoder.matches("password", "encoded_password")).thenReturn(true);
        when(tokenService.generateToken(mockUser)).thenReturn("fake-jwt-token");

        AuthResponseDTO response = authService.login(request);

        assertNotNull(response);
        assertEquals("fake-jwt-token", response.getToken());
        assertEquals("Test User", response.getName());
        assertEquals(Role.TENANT.name(), response.getRole());
    }

    @Test
    void login_WithInvalidCredentials_ShouldThrowBusinessException() {
        AuthRequestDTO request = new AuthRequestDTO();
        request.setEmail("test@email.com");
        request.setPassword("wrong_password");

        when(userRepository.findByEmail("test@email.com")).thenReturn(mockUser);
        when(passwordEncoder.matches("wrong_password", "encoded_password")).thenReturn(false);

        BusinessException ex = assertThrows(BusinessException.class, () -> authService.login(request));
        assertEquals("Credenciais inválidas", ex.getMessage());
    }

    @Test
    void resetPassword_WithValidToken_ShouldChangePassword() {
        PasswordResetToken resetToken = new PasswordResetToken("valid-token", mockUser, LocalDateTime.now().plusHours(1));
        
        when(passwordResetTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(resetToken));
        when(passwordEncoder.encode("newPassword")).thenReturn("new_encoded_password");

        authService.resetPassword("valid-token", "newPassword");

        verify(userRepository).save(mockUser);
        verify(passwordResetTokenRepository).delete(resetToken);
        assertEquals("new_encoded_password", mockUser.getPassword());
    }
}
