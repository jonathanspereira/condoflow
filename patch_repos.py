import re

with open("backend/src/main/java/com/jonathanspereira/condoflow/user/repository/UserRepository.java", "r") as f:
    user_content = f.read()

user_content = user_content.replace(':condominiumId IS NULL', ':condominiumId = -1L')

with open("backend/src/main/java/com/jonathanspereira/condoflow/user/repository/UserRepository.java", "w") as f:
    f.write(user_content)

with open("backend/src/main/java/com/jonathanspereira/condoflow/occurrence/repository/OccurrenceRepository.java", "r") as f:
    occ_content = f.read()

occ_content = occ_content.replace(':condominiumId IS NULL', ':condominiumId = -1L')
occ_content = occ_content.replace(':startDate IS NULL', '1 = 1') # We already make sure startDate is never null

with open("backend/src/main/java/com/jonathanspereira/condoflow/occurrence/repository/OccurrenceRepository.java", "w") as f:
    f.write(occ_content)

