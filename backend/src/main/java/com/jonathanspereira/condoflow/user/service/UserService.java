package com.jonathanspereira.condoflow.user.service;

import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import com.jonathanspereira.condoflow.user.dto.UserRequestDTO;
import com.jonathanspereira.condoflow.user.dto.UserResponseDTO;
import com.jonathanspereira.condoflow.user.entity.Role;
import com.jonathanspereira.condoflow.user.entity.User;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CondominiumRepository condominiumRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponseDTO createSyndic(UserRequestDTO dto) {
        // Verifica se o email já existe
        if (userRepository.findByEmail(dto.email()) != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este e-mail já está em uso.");
        }

        // Busca o condomínio
        Condominium condominium = condominiumRepository.findById(dto.condominiumId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Condomínio não encontrado."));

        // Cria o usuário com regra engessada de Síndico
        User syndic = new User();
        syndic.setName(dto.name());
        syndic.setEmail(dto.email());
        syndic.setPassword(passwordEncoder.encode(dto.password())); // Senha Criptografada!
        syndic.setRole(Role.SYNDIC);
        syndic.setCondominium(condominium);

        User savedUser = userRepository.save(syndic);
        return new UserResponseDTO(savedUser);
    }
}