import re

with open("backend/src/main/java/com/jonathanspereira/condoflow/user/repository/UserRepository.java", "r") as f:
    content = f.read()

content = content.replace(
    '"SELECT COUNT(u) FROM User u WHERE (:condominiumId = -1L OR (u.condominium IS NOT NULL AND u.condominium.id = :condominiumId))"',
    '"SELECT COUNT(u) FROM User u WHERE u.role != \'SUPER_ADMIN\' AND (:condominiumId = -1L OR (u.condominium IS NOT NULL AND u.condominium.id = :condominiumId))"'
)

with open("backend/src/main/java/com/jonathanspereira/condoflow/user/repository/UserRepository.java", "w") as f:
    f.write(content)
