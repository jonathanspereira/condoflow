import re

with open("backend/src/main/java/com/jonathanspereira/condoflow/occurrence/repository/OccurrenceRepository.java", "r") as f:
    occ_content = f.read()

occ_content = occ_content.replace('(1 = 1 OR o.createdAt >= :startDate)', 'o.createdAt >= :startDate')

with open("backend/src/main/java/com/jonathanspereira/condoflow/occurrence/repository/OccurrenceRepository.java", "w") as f:
    f.write(occ_content)

