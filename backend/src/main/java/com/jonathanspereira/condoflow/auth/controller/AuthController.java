package com.jonathanspereira.condoflow.auth.controller;

import com.jonathanspereira.condoflow.auth.dto.AuthRequestDTO;
import com.jonathanspereira.condoflow.auth.dto.AuthResponseDTO;
import com.jonathanspereira.condoflow.auth.service.AuthService;
import com.jonathanspereira.condoflow.auth.dto.ForgotPasswordRequestDTO;
import com.jonathanspereira.condoflow.auth.dto.ResetPasswordRequestDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody @Valid AuthRequestDTO requestDTO) {
        AuthResponseDTO response = authService.login(requestDTO);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register-sindico")
    public ResponseEntity<AuthResponseDTO> registerSindico(@RequestBody @Valid com.jonathanspereira.condoflow.auth.dto.RegisterSindicoRequestDTO requestDTO) {
        AuthResponseDTO response = authService.registerSindico(requestDTO);
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(response);
    }


    @PostMapping("/first-access")
    public ResponseEntity<Void> firstAccess(@RequestBody Map<String, String> request) {
        authService.firstAccess(request.get("email"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password")

    public ResponseEntity<Void> forgotPassword(@RequestBody @Valid ForgotPasswordRequestDTO requestDTO) {
        authService.forgotPassword(requestDTO.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody @Valid ResetPasswordRequestDTO requestDTO) {
        authService.resetPassword(requestDTO.getToken(), requestDTO.getNewPassword());
        return ResponseEntity.ok().build();
    }
}