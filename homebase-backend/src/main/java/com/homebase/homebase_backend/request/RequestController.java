package com.homebase.homebase_backend.request;

import com.homebase.homebase_backend.request.dto.CreateRequestDto;
import com.homebase.homebase_backend.request.dto.RequestResponseDto;
import com.homebase.homebase_backend.request.dto.UpdateRequestDto;
import com.homebase.homebase_backend.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;

    // POST /api/requests — any authenticated user can create
    @PostMapping
    public ResponseEntity<RequestResponseDto> create(
            @Valid @RequestBody CreateRequestDto dto,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(requestService.create(dto, currentUser));
    }

    // GET /api/requests — RBAC applied in service layer
    @GetMapping
    public ResponseEntity<Page<RequestResponseDto>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal User currentUser
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(
                requestService.getAll(status, priority, category, keyword, pageable, currentUser)
        );
    }

    // GET /api/requests/summary
    @GetMapping("/summary")
    public ResponseEntity<RequestService.DashboardSummary> getSummary(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(requestService.getSummary(currentUser));
    }

    // GET /api/requests/{id}
    @GetMapping("/{id}")
    public ResponseEntity<RequestResponseDto> getById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(requestService.getById(id, currentUser));
    }

    // PUT /api/requests/{id} — MANAGER + ADMIN only
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<RequestResponseDto> update(
            @PathVariable UUID id,
            @RequestBody UpdateRequestDto dto,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(requestService.update(id, dto, currentUser));
    }

    // DELETE /api/requests/{id} — ADMIN only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser
    ) {
        requestService.delete(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}