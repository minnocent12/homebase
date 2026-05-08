package com.homebase.homebase_backend.user;

import com.homebase.homebase_backend.comment.Comment;
import com.homebase.homebase_backend.comment.CommentRepository;
import com.homebase.homebase_backend.request.Request;
import com.homebase.homebase_backend.request.RequestRepository;
import com.homebase.homebase_backend.request.RequestStatus;
import com.homebase.homebase_backend.team.Team;
import com.homebase.homebase_backend.team.TeamRepository;
import com.homebase.homebase_backend.user.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository    userRepository;
    private final TeamRepository    teamRepository;
    private final PasswordEncoder   passwordEncoder;
    private final RequestRepository requestRepository;
    private final CommentRepository commentRepository;

    // GET /api/users — ADMIN sees all; MANAGER sees their team
    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getAll(
            @AuthenticationPrincipal User currentUser
    ) {
        List<User> users = currentUser.getRole() == UserRole.ADMIN
                ? userRepository.findAllByOrderByCreatedAtDesc()
                : (currentUser.getTeam() != null
                        ? userRepository.findByTeamOrderByCreatedAtDesc(currentUser.getTeam())
                        : List.of());

        return ResponseEntity.ok(users.stream().map(UserResponseDto::from).toList());
    }

    // GET /api/users/{id} — full profile; self-view allowed for any role; period: 7d | 30d | 12m
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<UserProfileDto> getProfile(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "7d") String period
    ) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        boolean isSelf    = currentUser.getId().equals(id);
        boolean isAdmin   = currentUser.getRole() == UserRole.ADMIN;
        boolean isManager = currentUser.getRole() == UserRole.MANAGER;

        if (!isSelf && !isAdmin) {
            if (isManager) {
                boolean sameTeam = currentUser.getTeam() != null
                        && target.getTeam() != null
                        && currentUser.getTeam().getId().equals(target.getTeam().getId());
                if (!sameTeam) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
                }
            } else {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
            }
        }

        return ResponseEntity.ok(buildProfile(target, period));
    }

    // POST /api/users — create a new user account
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

    // PUT /api/users/{id} — update user details (ADMIN only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> update(
            @PathVariable UUID id,
            @RequestBody UpdateUserDto dto
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            user.setFullName(dto.getFullName());
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            if (!dto.getEmail().equalsIgnoreCase(user.getEmail())
                    && userRepository.existsByEmail(dto.getEmail())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
            }
            user.setEmail(dto.getEmail());
        }
        if (dto.getRole() != null) {
            user.setRole(parseRole(dto.getRole()));
        }
        if (dto.getTeamId() != null) {
            if (dto.getTeamId().isBlank()) {
                user.setTeam(null);
            } else {
                Team team = teamRepository.findById(UUID.fromString(dto.getTeamId()))
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
                user.setTeam(team);
            }
        }

        return ResponseEntity.ok(UserResponseDto.from(userRepository.save(user)));
    }

    // PATCH /api/users/{id}/active — enable or disable account (ADMIN only; cannot disable self)
    @PatchMapping("/{id}/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> toggleActive(
            @PathVariable UUID id,
            @RequestBody Map<String, Boolean> body,
            @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot disable your own account");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Boolean active = body.get("active");
        if (active != null) {
            user.setActive(active);
        }
        return ResponseEntity.ok(UserResponseDto.from(userRepository.save(user)));
    }

    // PATCH /api/users/{id}/team — assign or remove team (ADMIN only)
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

    // DELETE /api/users/{id} — ADMIN only; blocked if user has associated records or is self
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot delete your own account");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        long requestsCreated  = requestRepository.countByCreatedBy(user);
        long requestsAssigned = requestRepository.countByAssignedTo(user);
        long comments         = commentRepository.countByUser(user);

        if (requestsCreated > 0 || requestsAssigned > 0 || comments > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete user with associated records (requests or comments)");
        }

        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }

    // ── Helpers ──────────────────────────────────────────────────
    private UserRole parseRole(String val) {
        if (val == null) return UserRole.ASSOCIATE;
        try { return UserRole.valueOf(val.toUpperCase()); }
        catch (IllegalArgumentException e) { return UserRole.ASSOCIATE; }
    }

    private UserProfileDto buildProfile(User target, String period) {
        List<Request> created  = requestRepository.findByCreatedByOrderByCreatedAtDesc(target);
        List<Request> assigned = requestRepository.findByAssignedToOrderByCreatedAtDesc(target);

        // Submitted breakdown
        long openCount       = created.stream().filter(r -> r.getStatus() == RequestStatus.OPEN).count();
        long inProgressCount = created.stream().filter(r -> r.getStatus() == RequestStatus.IN_PROGRESS).count();
        long resolvedCount   = created.stream().filter(r -> r.getStatus() == RequestStatus.RESOLVED).count();

        // Assigned breakdown
        long assignedOpen       = assigned.stream().filter(r -> r.getStatus() == RequestStatus.OPEN).count();
        long assignedInProgress = assigned.stream().filter(r -> r.getStatus() == RequestStatus.IN_PROGRESS).count();
        long assignedResolved   = assigned.stream().filter(r -> r.getStatus() == RequestStatus.RESOLVED).count();

        // Period-aware trend
        OffsetDateTime now = OffsetDateTime.now();
        List<UserProfileDto.ChartEntry> submittedTrend = new ArrayList<>();
        List<UserProfileDto.ChartEntry> assignedTrend  = new ArrayList<>();

        if ("12m".equals(period)) {
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yy");
            for (int i = 11; i >= 0; i--) {
                OffsetDateTime start = now.minusMonths(i).toLocalDate()
                        .withDayOfMonth(1).atStartOfDay().atOffset(now.getOffset());
                OffsetDateTime end = start.plusMonths(1);
                String label = start.format(fmt);
                long sc = created.stream()
                        .filter(r -> !r.getCreatedAt().isBefore(start) && r.getCreatedAt().isBefore(end)).count();
                long ac = assigned.stream()
                        .filter(r -> !r.getCreatedAt().isBefore(start) && r.getCreatedAt().isBefore(end)).count();
                submittedTrend.add(new UserProfileDto.ChartEntry(label, sc));
                assignedTrend.add(new UserProfileDto.ChartEntry(label, ac));
            }
        } else {
            int days = "30d".equals(period) ? 30 : 7;
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d");
            for (int i = days - 1; i >= 0; i--) {
                OffsetDateTime start = now.minusDays(i).toLocalDate()
                        .atStartOfDay().atOffset(now.getOffset());
                OffsetDateTime end = start.plusDays(1);
                String label = start.format(fmt);
                long sc = created.stream()
                        .filter(r -> !r.getCreatedAt().isBefore(start) && r.getCreatedAt().isBefore(end)).count();
                long ac = assigned.stream()
                        .filter(r -> !r.getCreatedAt().isBefore(start) && r.getCreatedAt().isBefore(end)).count();
                submittedTrend.add(new UserProfileDto.ChartEntry(label, sc));
                assignedTrend.add(new UserProfileDto.ChartEntry(label, ac));
            }
        }

        List<Comment> allComments = commentRepository.findByUserOrderByCreatedAtDesc(target);
        List<UserProfileDto.RecentComment> commentDtos = allComments.stream()
                .map(c -> new UserProfileDto.RecentComment(
                        c.getId(), c.getBody(),
                        c.getRequest().getTitle(), c.getRequest().getId(),
                        c.getCreatedAt()))
                .toList();

        List<UserProfileDto.RecentRequest> allSubmitted = created.stream()
                .map(r -> new UserProfileDto.RecentRequest(
                        r.getId(), r.getTitle(), r.getStatus().name(), r.getPriority().name(),
                        r.getCreatedAt()))
                .toList();

        List<UserProfileDto.RecentRequest> allAssigned = assigned.stream()
                .map(r -> new UserProfileDto.RecentRequest(
                        r.getId(), r.getTitle(), r.getStatus().name(), r.getPriority().name(),
                        r.getCreatedAt()))
                .toList();

        double avgResolutionHours = assigned.stream()
                .filter(r -> r.getStatus() == RequestStatus.RESOLVED)
                .mapToLong(r -> r.getUpdatedAt().toInstant().toEpochMilli()
                        - r.getCreatedAt().toInstant().toEpochMilli())
                .average()
                .stream()
                .map(ms -> ms / 3_600_000.0)
                .findFirst()
                .orElse(0.0);
        avgResolutionHours = Math.round(avgResolutionHours * 10.0) / 10.0;

        return UserProfileDto.builder()
                .id(target.getId())
                .fullName(target.getFullName())
                .email(target.getEmail())
                .role(target.getRole().name())
                .teamId(target.getTeam() != null ? target.getTeam().getId() : null)
                .teamName(target.getTeam() != null ? target.getTeam().getName() : null)
                .teamCategory(target.getTeam() != null && target.getTeam().getCategory() != null
                        ? target.getTeam().getCategory().name() : null)
                .createdAt(target.getCreatedAt())
                .active(target.isActive())
                .requestsCreated((long) created.size())
                .requestsAssigned((long) assigned.size())
                .commentsPosted(commentRepository.countByUser(target))
                .avgResolutionHours(avgResolutionHours)
                .openCount(openCount)
                .inProgressCount(inProgressCount)
                .resolvedCount(resolvedCount)
                .assignedOpenCount(assignedOpen)
                .assignedInProgressCount(assignedInProgress)
                .assignedResolvedCount(assignedResolved)
                .trendData(submittedTrend)
                .assignedTrendData(assignedTrend)
                .comments(commentDtos)
                .submittedRequests(allSubmitted)
                .assignedRequests(allAssigned)
                .build();
    }
}
