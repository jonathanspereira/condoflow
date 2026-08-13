package com.jonathanspereira.condoflow.user.service;

import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.entity.CondominiumManager;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumManagerRepository;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import com.jonathanspereira.condoflow.unit.entity.Unit;
import com.jonathanspereira.condoflow.unit.repository.UnitRepository;
import com.jonathanspereira.condoflow.user.dto.LinkSindicoRequestDTO;
import com.jonathanspereira.condoflow.user.dto.LinkSindicoResponseDTO;
import com.jonathanspereira.condoflow.user.dto.UserRequestDTO;
import com.jonathanspereira.condoflow.user.dto.UserResponseDTO;
import com.jonathanspereira.condoflow.user.entity.Role;
import com.jonathanspereira.condoflow.user.entity.User;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CondominiumRepository condominiumRepository;
    private final CondominiumManagerRepository condominiumManagerRepository;
    private final UnitRepository unitRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponseDTO createUser(UserRequestDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()) != null) {
            throw new RuntimeException("Email já cadastrado no sistema.");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());

        if (dto.getCondominiumId() != null) {
            Condominium condominium = condominiumRepository.findById(dto.getCondominiumId())
                    .orElseThrow(() -> new RuntimeException("Condomínio não encontrado."));
            user.setCondominium(condominium);
        }

        User savedUser = userRepository.save(user);
        return new UserResponseDTO(savedUser);
    }

    public UserResponseDTO findByEmail(String email) {
        UserDetails userDetails = userRepository.findByEmail(email);
        if (userDetails == null) {
            throw new RuntimeException("Usuário não encontrado com o e-mail: " + email);
        }
        User user = (User) userDetails;

        Unit unit = unitRepository.findByOwnerId(user.getId())
                .or(() -> unitRepository.findByTenantId(user.getId()))
                .orElse(null);

        return new UserResponseDTO(user, unit);
    }

    public UserResponseDTO updateMyProfile(String currentEmail, UserRequestDTO dto) {
        UserDetails details = userRepository.findByEmail(currentEmail);
        if (details == null) {
            throw new RuntimeException("Usuário não encontrado.");
        }
        User user = (User) details;

        if (dto.getEmail() != null && !dto.getEmail().isBlank()
                && !dto.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.findByEmail(dto.getEmail()) != null) {
                throw new RuntimeException("Email já cadastrado no sistema.");
            }
            user.setEmail(dto.getEmail());
        }

        User updated = userRepository.save(user);

        Unit unit = unitRepository.findByOwnerId(updated.getId())
                .or(() -> unitRepository.findByTenantId(updated.getId()))
                .orElse(null);

        return new UserResponseDTO(updated, unit);
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

        if (!user.getEmail().equals(dto.getEmail()) && userRepository.findByEmail(dto.getEmail()) != null) {
            throw new RuntimeException("Email já cadastrado no sistema.");
        }

        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());

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

    public UserResponseDTO manageTenant(String ownerEmail, UserRequestDTO dto) {
        UserDetails ownerDetails = userRepository.findByEmail(ownerEmail);
        if (ownerDetails == null) {
            throw new RuntimeException("Usuário não encontrado.");
        }
        User owner = (User) ownerDetails;

        if (dto.getUnitId() == null) {
            throw new RuntimeException("Unidade não informada.");
        }

        Unit unit = unitRepository.findById(dto.getUnitId())
                .orElseThrow(() -> new RuntimeException("Unidade não encontrada."));

        if (!unit.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Você não tem permissão para alterar esta unidade.");
        }

        if (Boolean.TRUE.equals(dto.getIsRented())) {
            if (dto.getEmail() == null || dto.getEmail().isBlank()) {
                throw new RuntimeException("Informe o e-mail do inquilino.");
            }

            UserDetails existing = userRepository.findByEmail(dto.getEmail());
            User tenant;
            if (existing != null) {
                tenant = (User) existing;
            } else {
                tenant = new User();
                tenant.setName(dto.getName() != null ? dto.getName() : "Inquilino");
                tenant.setEmail(dto.getEmail());
                tenant.setPassword(passwordEncoder.encode(dto.getPassword()));
                tenant.setRole(Role.TENANT);
                tenant.setCondominium(owner.getCondominium());
                tenant = userRepository.save(tenant);
            }
            unit.setTenant(tenant);
            unit.setRented(true);
        } else {
            unit.setTenant(null);
            unit.setRented(false);
        }

        Unit savedUnit = unitRepository.save(unit);
        return new UserResponseDTO(owner, savedUnit);
    }

    @Transactional
    public LinkSindicoResponseDTO linkSindico(Long condominiumId, LinkSindicoRequestDTO dto) {
        Condominium condominium = condominiumRepository.findById(condominiumId)
                .orElseThrow(() -> new RuntimeException("Condomínio não encontrado."));

        UserDetails existing = userRepository.findByEmail(dto.email());
        User user;
        String temporaryPassword = null;

        if (existing != null) {
            user = (User) existing;
            user.setRole(Role.SINDICO);
            user = userRepository.save(user);
        } else {
            if (dto.name() == null || dto.name().isBlank()) {
                throw new RuntimeException("Informe o nome do síndico para criar um novo acesso.");
            }
            temporaryPassword = generateTemporaryPassword();

            user = new User();
            user.setName(dto.name());
            user.setEmail(dto.email());
            user.setPassword(passwordEncoder.encode(temporaryPassword));
            user.setRole(Role.SINDICO);
            user = userRepository.save(user);
        }

        boolean alreadyLinked = condominiumManagerRepository
                .findByCondominiumIdAndSindicoId(condominiumId, user.getId())
                .isPresent();

        if (!alreadyLinked) {
            CondominiumManager management = new CondominiumManager();
            management.setCondominium(condominium);
            management.setSindico(user);
            management.setFocusModeEnabled(false);
            condominiumManagerRepository.save(management);
        }

        return new LinkSindicoResponseDTO(new UserResponseDTO(user), temporaryPassword);
    }

    private String generateTemporaryPassword() {
        return "Cf" + UUID.randomUUID().toString().substring(0, 8) + "!";
    }
}