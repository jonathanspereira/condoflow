package com.jonathanspereira.condoflow.user.controller;

import com.jonathanspereira.condoflow.user.dto.ChangePasswordRequestDTO;
import com.jonathanspereira.condoflow.user.dto.UserRequestDTO;
import com.jonathanspereira.condoflow.user.dto.UserResponseDTO;
import com.jonathanspereira.condoflow.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {
    @PostMapping("/mass")
    public ResponseEntity<List<UserResponseDTO>> createUsersMass(@RequestBody List<UserRequestDTO> dtos) {
        List<UserResponseDTO> responses = userService.createUsersMass(dtos);
        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }


    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getMyProfile(Principal principal) {
        String email = principal.getName();
        UserResponseDTO response = userService.findByEmail(email);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponseDTO> updateMyProfile(@RequestBody UserRequestDTO dto, Principal principal) {
        UserResponseDTO response = userService.updateMyProfile(principal.getName(), dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> create(@RequestBody @Valid UserRequestDTO requestDTO) {
        UserResponseDTO response = userService.createUser(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> findAll() {
        List<UserResponseDTO> response = userService.findAll();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> update(@PathVariable String id, @RequestBody @Valid UserRequestDTO requestDTO) {
        UserResponseDTO response = userService.update(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/tenant")
    public ResponseEntity<UserResponseDTO> manageTenant(@RequestBody UserRequestDTO dto, Principal principal) {
        UserResponseDTO response = userService.manageTenant(principal.getName(), dto);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@RequestBody @Valid ChangePasswordRequestDTO dto, Principal principal) {
        userService.changePassword(principal.getName(), dto.getOldPassword(), dto.getNewPassword());
        return ResponseEntity.ok().build();
    }
}