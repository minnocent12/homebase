package com.homebase.homebase_backend.user;

import com.homebase.homebase_backend.team.Team;
import com.homebase.homebase_backend.team.TeamRepository;
import com.homebase.homebase_backend.user.dto.AssignTeamRequest;
import com.homebase.homebase_backend.user.dto.CreateUserDto;
import com.homebase.homebase_backend.user.dto.UserResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository  userRepository;
    private final TeamRepository  teamRepository;
    private final PasswordEncoder passwordEncoder;

    // GET /api/users
    // ADMIN → all users; MANAGER → only their team's users
    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getAll(
            @AuthenticationPrincipal User currentUser
    ) {
        List<User> users = currentUser.getRole() == UserRole.ADMIN
                ? userRepository.findAll()
                : (currentUser.getTeam() != null
                        ? userRepository.findByTeam(currentUser.getTeam())
                        : List.of());

        return ResponseEntity.ok(users.stream().map(UserResponseDto::from).toList());
    }

    // POST /api/users — create a new user account
    // ADMIN: any role, any team
    // MANAGER: ASSOCIATE only, their team only
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<UserResponseDto> create(
            @Valid @RequestBody CreateUserDto dto,
            @AuthenticationPrincipal User currentUser
    ) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        UserRole role;
        Team team = null;

        if (currentUser.getRole() == UserRole.ADMIN) {
            role = parseRole(dto.getRole());
            if (dto.getTeamId() != null) {
                team = teamRepository.findById(dto.getTeamId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
            }
        } else {
            // MANAGER: force ASSOCIATE role, force their own team
            role = UserRole.ASSOCIATE;
            team = currentUser.getTeam();
            if (team == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "You must be assigned to a team before creating users");
            }
        }

        User newUser = User.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .role(role)
                .team(team)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(UserResponseDto.from(userRepository.save(newUser)));
    }

    // PATCH /api/users/{id}/team — ADMIN only
    @PatchMapping("/{id}/team")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> assignTeam(
            @PathVariable UUID id,
            @RequestBody AssignTeamRequest body
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (body.getTeamId() == null) {
            user.setTeam(null);
        } else {
            Team team = teamRepository.findById(body.getTeamId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
            user.setTeam(team);
        }

        return ResponseEntity.ok(UserResponseDto.from(userRepository.save(user)));
    }

    // ── Helper ───────────────────────────────────────────────────
    private UserRole parseRole(String val) {
        if (val == null) return UserRole.ASSOCIATE;
        try { return UserRole.valueOf(val.toUpperCase()); }
        catch (IllegalArgumentException e) { return UserRole.ASSOCIATE; }
    }
}
