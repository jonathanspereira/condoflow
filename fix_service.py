import re

with open("backend/src/main/java/com/jonathanspereira/condoflow/occurrence/service/OccurrenceService.java", "r") as f:
    content = f.read()

content = content.replace('message.setSenderName("Administração"); // Generic sender for now', '// sender is null for now since we do not have the user context in update')

with open("backend/src/main/java/com/jonathanspereira/condoflow/occurrence/service/OccurrenceService.java", "w") as f:
    f.write(content)
