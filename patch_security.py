import re

with open("backend/src/main/java/com/jonathanspereira/condoflow/common/security/SecurityConfig.java", "r") as f:
    content = f.read()

content = content.replace(
    '.requestMatchers(HttpMethod.GET, "/api/v1/occurrences/*/attachments/*").permitAll()',
    '.requestMatchers(HttpMethod.GET, "/api/v1/occurrences/*/attachments/*").permitAll()\n                .requestMatchers(HttpMethod.POST, "/api/v1/occurrences/*/attachments").permitAll()'
)

with open("backend/src/main/java/com/jonathanspereira/condoflow/common/security/SecurityConfig.java", "w") as f:
    f.write(content)
