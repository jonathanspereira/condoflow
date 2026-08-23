package com.jonathanspereira.condoflow.common.config;

import com.jonathanspereira.condoflow.user.entity.Role;
import com.jonathanspereira.condoflow.user.entity.User;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Value("${app.admin.email:admin@condoflow.com}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Construtor manual para a injeção de dependências do Spring
    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        

        if (userRepository.findByEmail(adminEmail) == null) {
            User superAdmin = new User();
            superAdmin.setName("Super Administrador");
            superAdmin.setEmail(adminEmail);
            superAdmin.setPassword(passwordEncoder.encode(adminPassword));
            superAdmin.setRole(Role.SUPER_ADMIN);
            superAdmin.setCondominium(null);

            userRepository.save(superAdmin);
            System.out.println("✅ Super Admin padrão criado com sucesso: " + adminEmail);
        }
    }

}