package com.jonathanspereira.condoflow.unit.service;

import com.jonathanspereira.condoflow.common.exception.BusinessException;
import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import com.jonathanspereira.condoflow.unit.dto.UnitRequestDTO;
import com.jonathanspereira.condoflow.unit.entity.Unit;
import com.jonathanspereira.condoflow.unit.repository.UnitRepository;
import com.jonathanspereira.condoflow.user.entity.Role;
import com.jonathanspereira.condoflow.user.entity.User;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UnitService {

    private static final Logger log = LoggerFactory.getLogger(UnitService.class);

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CondominiumRepository condominiumRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Unit> listarPorCondominio(Long condominiumId) {
        return unitRepository.findByCondominiumId(condominiumId);
    }

    public Optional<Unit> buscarPorId(Long id) {
        return unitRepository.findById(id);
    }

    public Unit salvar(Long condominiumId, UnitRequestDTO dto) {
        Optional<Unit> existing = buscarPorCondominioEUnidade(condominiumId, dto.getUnit());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("A unidade " + dto.getUnit() + " já possui cadastro neste condomínio.");
        }

        User owner = resolveOrCreateUser(dto.getOwnerName(), dto.getOwnerEmail(), Role.PROPRIETARY, condominiumId);

        User tenant = null;
        if (dto.isRented()) {
            if (dto.getTenantEmail() == null || dto.getTenantEmail().isBlank()) {
                throw new IllegalArgumentException("E-mail do inquilino é obrigatório quando a unidade está marcada como alugada.");
            }
            tenant = resolveOrCreateUser(dto.getTenantName(), dto.getTenantEmail(), Role.TENANT, condominiumId);
        }

        Unit unit = new Unit();
        unit.setUnit(dto.getUnit());
        unit.setCondominiumId(condominiumId);
        unit.setOwner(owner);
        unit.setRented(dto.isRented());
        unit.setTenant(tenant);

        return unitRepository.save(unit);
    }

    public List<Unit> salvarEmMassa(Long condominiumId, List<UnitRequestDTO> dtos) {
        return dtos.stream()
                .map(dto -> salvar(condominiumId, dto))
                .collect(Collectors.toList());
    }

    public Unit atualizar(Long id, UnitRequestDTO dto) {
        return unitRepository.findById(id).map(unit -> {
            unit.setUnit(dto.getUnit());

            User owner = resolveOrCreateUser(dto.getOwnerName(), dto.getOwnerEmail(), Role.PROPRIETARY, unit.getCondominiumId());
            unit.setOwner(owner);

            unit.setRented(dto.isRented());
            if (dto.isRented()) {
                User tenant = resolveOrCreateUser(dto.getTenantName(), dto.getTenantEmail(), Role.TENANT, unit.getCondominiumId());
                unit.setTenant(tenant);
            } else {
                unit.setTenant(null);
            }

            return unitRepository.save(unit);
        }).orElseThrow(() -> new RuntimeException("Unidade não encontrada com o ID: " + id));
    }

    public void deletar(Long id) {
        unitRepository.deleteById(id);
    }

    private User resolveOrCreateUser(String name, String email, Role role, Long condominiumId) {
        User existing = (User) userRepository.findByEmail(email);
        if (existing != null) {
            return existing;
        }

        Condominium condominium = condominiumRepository.findById(condominiumId)
                .orElseThrow(() -> new RuntimeException("Condomínio não encontrado: " + condominiumId));

        // Senha extremamente longa e aleatória, impedindo login sem antes passar pelo "Primeiro Acesso"
        String randomPassword = java.util.UUID.randomUUID().toString() + java.util.UUID.randomUUID().toString();

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(randomPassword));
        user.setRole(role);

        User saved = userRepository.save(user);

        log.info("Usuário {} criado via Sindico. Deve realizar Primeiro Acesso.", saved.getEmail());

        return saved;
    }

    // Descobre o condomínio do usuário autenticado a partir do e-mail (subject do JWT)
    public Long obterCondominioDoUsuarioLogado(String email) {
        User user = (User) userRepository.findByEmail(email);
        if (user == null) {
            throw new BusinessException("Usuário não encontrado: " + email);
        }

        return 0L;
    }

    // Busca a unidade por nome/número, restrita ao condomínio informado
    public Optional<Unit> buscarPorCondominioEUnidade(Long condominiumId, String unit) {
        return unitRepository.findByCondominiumIdAndUnitIgnoreCase(condominiumId, unit.trim());
    }

    public List<Unit> findAllMyUnits(String email) {
        User user = (User) userRepository.findByEmail(email);
        if (user == null) {
            throw new BusinessException("Usuário não encontrado.");
        }
        List<Unit> ownedUnits = unitRepository.findAllByOwnerId(user.getId());
        List<Unit> rentedUnits = unitRepository.findAllByTenantId(user.getId());
        
        ownedUnits.addAll(rentedUnits);
        return ownedUnits.stream().distinct().toList();
    }
}