import re

with open("backend/src/main/java/com/jonathanspereira/condoflow/user/service/UserService.java", "r") as f:
    content = f.read()

mass_logic = """
    @Transactional
    public List<UserResponseDTO> createUsersMass(List<UserRequestDTO> dtos) {
        return dtos.stream().map(this::createUser).collect(Collectors.toList());
    }
"""

content = content.replace('public UserResponseDTO createUser(UserRequestDTO dto) {', mass_logic + '\n    public UserResponseDTO createUser(UserRequestDTO dto) {')

with open("backend/src/main/java/com/jonathanspereira/condoflow/user/service/UserService.java", "w") as f:
    f.write(content)

with open("backend/src/main/java/com/jonathanspereira/condoflow/user/controller/UserController.java", "r") as f:
    controller_content = f.read()

endpoint = """
    @PostMapping("/mass")
    public ResponseEntity<List<UserResponseDTO>> createUsersMass(@RequestBody List<UserRequestDTO> dtos) {
        List<UserResponseDTO> responses = userService.createUsersMass(dtos);
        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }
"""

controller_content = controller_content.replace('public class UserController {', 'public class UserController {' + endpoint)

with open("backend/src/main/java/com/jonathanspereira/condoflow/user/controller/UserController.java", "w") as f:
    f.write(controller_content)

