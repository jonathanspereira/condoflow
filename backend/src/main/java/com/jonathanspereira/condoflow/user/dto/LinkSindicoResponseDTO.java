package com.jonathanspereira.condoflow.user.dto;

public record LinkSindicoResponseDTO(
        UserResponseDTO user,
        String temporaryPassword // preenchido apenas quando uma conta nova foi criada
) {}