package com.jonathanspereira.condoflow.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequestDTO {
    
    @NotBlank(message = "Token é obrigatório")
    private String token;

    @NotBlank(message = "A nova senha é obrigatória")
    @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres")
    private String newPassword;
}
