package com.jonathanspereira.condoflow.condominium.service;
import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.entity.CondominiumRole;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRoleRepository;
import com.jonathanspereira.condoflow.user.entity.Role;
import com.jonathanspereira.condoflow.user.entity.User;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
import com.jonathanspereira.condoflow.log.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class CondominiumService {

    @Autowired
    private CondominiumRepository condominiumRepository;

    @Autowired
    private CondominiumRoleRepository condominiumRoleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<Condominium> listarTodos() {
        return condominiumRepository.findAll();
    }

    public Optional<Condominium> buscarPorId(Long id) {
        return condominiumRepository.findById(id);
    }

    public Condominium salvar(Condominium condominium) {
        Condominium saved = condominiumRepository.save(condominium);
        auditLogService.log("CONDOMINIO", "CREATE", saved.getName(), "Condomínio criado pelo sistema/admin");
        return saved;
    }

    public Condominium atualizar(Long id, Condominium condominiumData) {
        return condominiumRepository.findById(id).map(condo -> {
            condo.setName(condominiumData.getName());
            condo.setCnpj(condominiumData.getCnpj());
            condo.setStreet(condominiumData.getStreet());
            condo.setNumber(condominiumData.getNumber());
            condo.setZipCode(condominiumData.getZipCode());
            condo.setNeighborhood(condominiumData.getNeighborhood());
            condo.setCity(condominiumData.getCity());
            condo.setState(condominiumData.getState());
            Condominium saved = condominiumRepository.save(condo);
            auditLogService.log("CONDOMINIO", "UPDATE", saved.getName(), "Condomínio atualizado");
            return saved;
        }).orElseThrow(() -> new RuntimeException("Condomínio não encontrado com o ID: " + id));
    }

    @Transactional
    public void deletar(Long id) {
        // Busca todos os usuários (síndicos) ligados a esse condomínio
        List<CondominiumRole> roles = condominiumRoleRepository.findByCondominiumId(id);
        List<User> sindicosToCheck = roles.stream()
                .filter(r -> r.getRole() == Role.SINDICO)
                .map(CondominiumRole::getUser)
                .distinct()
                .toList();

        // Deleta o condomínio (as roles serão removidas por cascade)
        condominiumRepository.deleteById(id);

        // Após a deleção, verifica quais síndicos não têm mais nenhum condomínio ativo
        for (User sindico : sindicosToCheck) {
            List<CondominiumRole> remainingRoles = condominiumRoleRepository.findByUserId(sindico.getId());
            boolean hasActiveCondominium = remainingRoles.stream()
                    .anyMatch(r -> r.isActive() && r.getRole() == Role.SINDICO);
            if (!hasActiveCondominium) {
                sindico.setActive(false);
                userRepository.save(sindico);
            }
        }
        
        auditLogService.log("CONDOMINIO", "DELETE", String.valueOf(id), "Condomínio deletado do sistema");
    }
}
