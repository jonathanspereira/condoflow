package com.jonathanspereira.condoflow.user.service;

import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import com.jonathanspereira.condoflow.user.dto.UserRequestDTO;
import com.jonathanspereira.condoflow.user.dto.UserResponseDTO;
import com.jonathanspereira.condoflow.user.entity.User;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CondominiumRepository condominiumRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponseDTO createUser(UserRequestDTO dto) {
        // Verifica se o email já existe
        if (userRepository.findByEmail(dto.getEmail()) != null) {
            throw new RuntimeException("Email já cadastrado no sistema.");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());

        // Se um ID de condomínio foi enviado, busca no banco e vincula
        if (dto.getCondominiumId() != null) {
            Condominium condominium = condominiumRepository.findById(Long.valueOf(String.valueOf(dto.getCondominiumId())))
                    .orElseThrow(() -> new RuntimeException("Condomínio não encontrado."));
            user.setCondominium(condominium);
        }

        User savedUser = userRepository.save(user);
        return new UserResponseDTO(savedUser);
    }

    public List<UserResponseDTO> findAll() {
        return userRepository.findAll()
                .stream()
                .map(UserResponseDTO::new)
                .collect(Collectors.toList());
    }

    public UserResponseDTO update(String id, UserRequestDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        // Verifica se o email está sendo alterado e se já existe no sistema
        if (!user.getEmail().equals(dto.getEmail()) && userRepository.findByEmail(dto.getEmail()) != null) {
            throw new RuntimeException("Email já cadastrado no sistema.");
        }

        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());

        // Atualiza o vínculo com o condomínio
        if (dto.getCondominiumId() != null) {
            Condominium condominium = condominiumRepository.findById(dto.getCondominiumId())
                    .orElseThrow(() -> new RuntimeException("Condomínio não encontrado."));
            user.setCondominium(condominium);
        } else {
            user.setCondominium(null);
        }

        User updatedUser = userRepository.save(user);
        return new UserResponseDTO(updatedUser);
    }

    public void delete(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        userRepository.delete(user);
    }
}