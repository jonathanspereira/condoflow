package com.jonathanspereira.condoflow.user.controller;

import com.jonathanspereira.condoflow.user.dto.UserRequestDTO;
import com.jonathanspereira.condoflow.user.dto.UserResponseDTO;
import com.jonathanspereira.condoflow.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    // Apenas o Super Administrador pode cadastrar um Síndico
    @PostMapping("/syndic")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UserResponseDTO> createSyndic(@RequestBody @Valid UserRequestDTO dto) {
        UserResponseDTO response = userService.createSyndic(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}