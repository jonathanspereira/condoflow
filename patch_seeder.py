import re

with open("backend/src/main/java/com/jonathanspereira/condoflow/common/config/DatabaseSeeder.java", "r") as f:
    content = f.read()

# Add import
if "import org.springframework.beans.factory.annotation.Value;" not in content:
    content = content.replace(
        "import org.springframework.boot.CommandLineRunner;",
        "import org.springframework.beans.factory.annotation.Value;\nimport org.springframework.boot.CommandLineRunner;"
    )

# Add properties
props = """    @Value("${app.admin.email:admin@condoflow.com}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    private final UserRepository userRepository;"""
content = content.replace("    private final UserRepository userRepository;", props)

# Replace hardcoded values
content = content.replace('String adminEmail = "admin@condoflow.com";', '')
content = content.replace('superAdmin.setPassword(passwordEncoder.encode("admin123"));', 'superAdmin.setPassword(passwordEncoder.encode(adminPassword));')

with open("backend/src/main/java/com/jonathanspereira/condoflow/common/config/DatabaseSeeder.java", "w") as f:
    f.write(content)
