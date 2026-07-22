package com.jonathanspereira.condoflow.user.dto;

import com.jonathanspereira.condoflow.user.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserRequestDTO {

        @NotBlank(message = "O nome é obrigatório")
        private String name;

        @Email(message = "Email inválido")
        @NotBlank(message = "O email é obrigatório")
        private String email;

        @NotBlank(message = "A senha é obrigatória")
        private String password;

        @NotNull(message = "A role (cargo) é obrigatória")
        private Role role;

        // Pode ser nulo se for outro Super Admin, mas obrigatório para Síndicos e Moradores
        private Long condominiumId;
}