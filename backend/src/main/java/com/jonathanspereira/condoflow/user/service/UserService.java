package com.jonathanspereira.condoflow.user.service;

import com.jonathanspereira.condoflow.common.exception.BusinessException;
import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.entity.CondominiumRole;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRoleRepository;
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
    private final CondominiumRoleRepository condominiumRoleRepository;
    private final UnitRepository unitRepository;
    private final PasswordEncoder passwordEncoder;

    
    @Transactional
    public List<UserResponseDTO> createUsersMass(List<UserRequestDTO> dtos) {
        return dtos.stream().map(this::createUser).collect(Collectors.toList());
    }

    public UserResponseDTO createUser(UserRequestDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()) != null) {
            throw new BusinessException("Email já cadastrado no sistema.");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());

        if (dto.getCondominiumId() != null) {
            Condominium condominium = condominiumRepository.findById(dto.getCondominiumId())
                    .orElseThrow(() -> new RuntimeException("Condomínio não encontrado."));
        }

        User savedUser = userRepository.save(user);
        return new UserResponseDTO(savedUser);
    }

    public UserResponseDTO findByEmail(String email) {
        UserDetails userDetails = userRepository.findByEmail(email);
        if (userDetails == null) {
            throw new BusinessException("Usuário não encontrado com o e-mail: " + email);
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
            throw new BusinessException("Usuário não encontrado.");
        }
        User user = (User) details;

        if (dto.getEmail() != null && !dto.getEmail().isBlank()
                && !dto.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.findByEmail(dto.getEmail()) != null) {
                throw new BusinessException("Email já cadastrado no sistema.");
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
            throw new BusinessException("Email já cadastrado no sistema.");
        }

        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());

        if (dto.getCondominiumId() != null) {
            Condominium condominium = condominiumRepository.findById(dto.getCondominiumId())
                    .orElseThrow(() -> new RuntimeException("Condomínio não encontrado."));
        } else {
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
            throw new BusinessException("Usuário não encontrado.");
        }
        User owner = (User) ownerDetails;

        if (dto.getUnitId() == null) {
            throw new BusinessException("Unidade não informada.");
        }

        Unit unit = unitRepository.findById(dto.getUnitId())
                .orElseThrow(() -> new RuntimeException("Unidade não encontrada."));

        if (!unit.getOwner().getId().equals(owner.getId())) {
            throw new BusinessException("Você não tem permissão para alterar esta unidade.");
        }

        if (Boolean.TRUE.equals(dto.getIsRented())) {
            if (dto.getEmail() == null || dto.getEmail().isBlank()) {
                throw new BusinessException("Informe o e-mail do inquilino.");
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
                throw new BusinessException("Informe o nome do síndico para criar um novo acesso.");
            }
            temporaryPassword = generateTemporaryPassword();

            user = new User();
            user.setName(dto.name());
            user.setEmail(dto.email());
            user.setPassword(passwordEncoder.encode(temporaryPassword));
            user.setRole(Role.SINDICO);
            user = userRepository.save(user);
        }

        List<CondominiumRole> existingManagers = condominiumRoleRepository.findByCondominiumId(condominiumId);
        String userId = user.getId();
        boolean alreadyLinked = existingManagers.stream().anyMatch(m -> m.getUser().getId().equals(userId));

        if (!alreadyLinked) {
            existingManagers.forEach(m -> m.setActive(false));
            condominiumRoleRepository.saveAll(existingManagers);

            CondominiumRole management = new CondominiumRole();
            management.setUser(user);
            management.setCondominium(condominium);
            management.setRole(Role.SINDICO);
            management.setActive(true);
            management.setFocusModeEnabled(false);
            condominiumRoleRepository.save(management);
        }

        return new LinkSindicoResponseDTO(new UserResponseDTO(user), temporaryPassword);
    }

    private String generateTemporaryPassword() {
        return "Cf" + UUID.randomUUID().toString().substring(0, 8) + "!";
    }

    public void changePassword(String email, String oldPassword, String newPassword) {
        UserDetails userDetails = userRepository.findByEmail(email);
        if (userDetails == null) {
            throw new BusinessException("Usuário não encontrado.");
        }
        User user = (User) userDetails;

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BusinessException("A senha atual informada está incorreta.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}