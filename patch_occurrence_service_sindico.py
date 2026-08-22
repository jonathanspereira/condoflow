import re

with open("backend/src/main/java/com/jonathanspereira/condoflow/occurrence/service/OccurrenceService.java", "r") as f:
    content = f.read()

# Add import
if "import com.jonathanspereira.condoflow.condominium.repository.CondominiumManagerRepository;" not in content:
    content = content.replace(
        "import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;",
        "import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;\nimport com.jonathanspereira.condoflow.condominium.repository.CondominiumManagerRepository;\nimport com.jonathanspereira.condoflow.condominium.entity.CondominiumManager;"
    )

# Inject repository
if "private final CondominiumManagerRepository condominiumManagerRepository;" not in content:
    content = content.replace(
        "private final NotificationService notificationService;",
        "private final NotificationService notificationService;\n    private final CondominiumManagerRepository condominiumManagerRepository;"
    )

# Replace sindicos fetch
new_fetch = "List<User> sindicos = condominiumManagerRepository.findByCondominiumId(condominium.getId()).stream().map(CondominiumManager::getSindico).collect(Collectors.toList());"
content = content.replace(
    "List<User> sindicos = userRepository.findByCondominiumIdAndRole(condominium.getId(), Role.SINDICO);",
    new_fetch
)

with open("backend/src/main/java/com/jonathanspereira/condoflow/occurrence/service/OccurrenceService.java", "w") as f:
    f.write(content)
