import re

with open("backend/src/main/java/com/jonathanspereira/condoflow/auth/controller/AuthController.java", "r") as f:
    content = f.read()

first_access_code = """
    @PostMapping("/first-access")
    public ResponseEntity<Void> firstAccess(@RequestBody Map<String, String> request) {
        authService.firstAccess(request.get("email"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password")
"""

content = content.replace('    @PostMapping("/forgot-password")', first_access_code)

if "import java.util.Map;" not in content:
    content = content.replace(
        "import org.springframework.web.bind.annotation.*;",
        "import org.springframework.web.bind.annotation.*;\nimport java.util.Map;"
    )

with open("backend/src/main/java/com/jonathanspereira/condoflow/auth/controller/AuthController.java", "w") as f:
    f.write(content)
