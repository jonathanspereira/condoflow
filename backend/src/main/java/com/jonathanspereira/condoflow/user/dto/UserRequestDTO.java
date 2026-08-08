package com.jonathanspereira.condoflow.user.dto;

import com.jonathanspereira.condoflow.user.entity.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserRequestDTO {

    @NotBlank(message = "O nome é obrigatório")
    private String name;

    @NotBlank(message = "O e-mail é obrigatório")
    private String email;

    @NotBlank(message = "A senha é obrigatória")
    private String password;

    private Role role;
    private Long condominiumId;

    private Long unitId;
    private Boolean isRented;
}