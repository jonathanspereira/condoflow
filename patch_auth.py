with open("backend/src/main/java/com/jonathanspereira/condoflow/auth/service/AuthService.java", "r") as f:
    content = f.read()

import_str = """
import com.jonathanspereira.condoflow.auth.dto.RegisterSindicoRequestDTO;
import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.entity.CondominiumRole;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRoleRepository;
import com.jonathanspereira.condoflow.user.entity.Role;
import org.springframework.transaction.annotation.Transactional;
"""
content = content.replace("import lombok.RequiredArgsConstructor;", import_str + "import lombok.RequiredArgsConstructor;")

deps = """
    private final CondominiumRepository condominiumRepository;
    private final CondominiumRoleRepository condominiumRoleRepository;
"""
content = content.replace("private final EmailService emailService;", "private final EmailService emailService;\n" + deps)

method = """
    @Transactional
    public AuthResponseDTO registerSindico(RegisterSindicoRequestDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()) != null) {
            throw new BusinessException("E-mail já cadastrado.");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(Role.SINDICO);
        User savedUser = userRepository.save(user);

        Condominium condominium = new Condominium();
        condominium.setName(dto.getCondominiumName());
        condominium.setAddress("A ser preenchido");
        Condominium savedCondo = condominiumRepository.save(condominium);

        CondominiumRole role = new CondominiumRole();
        role.setCondominium(savedCondo);
        role.setUser(savedUser);
        role.setRole(Role.SINDICO);
        role.setActive(true);
        role.setFocusModeEnabled(false);
        condominiumRoleRepository.save(role);

        String token = tokenService.generateToken(savedUser);
        return new AuthResponseDTO(token, savedUser.getName(), savedUser.getEmail(), savedUser.getRole().name());
    }
"""

content = content.replace("public AuthResponseDTO login", method + "\n    public AuthResponseDTO login")

with open("backend/src/main/java/com/jonathanspereira/condoflow/auth/service/AuthService.java", "w") as f:
    f.write(content)
