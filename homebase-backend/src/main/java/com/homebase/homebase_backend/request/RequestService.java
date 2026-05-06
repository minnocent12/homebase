package com.homebase.homebase_backend.request;

import com.homebase.homebase_backend.request.dto.CreateRequestDto;
import com.homebase.homebase_backend.request.dto.RequestResponseDto;
import com.homebase.homebase_backend.request.dto.UpdateRequestDto;
import com.homebase.homebase_backend.user.User;
import com.homebase.homebase_backend.user.UserRepository;
import com.homebase.homebase_backend.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final RequestRepository requestRepository;
    private final UserRepository userRepository;

    // ── Create ───────────────────────────────────────────────
    @Transactional
    public RequestResponseDto create(CreateRequestDto dto, User currentUser) {
        Request request = Request.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(parsePriority(dto.getPriority()))
                .category(parseCategory(dto.getCategory()))
                .status(RequestStatus.OPEN)
                .createdBy(currentUser)
                .build();

        return RequestResponseDto.from(requestRepository.save(request));
    }

    // ── Get All (RBAC aware, all filters combined with AND) ──────
    @Transactional(readOnly = true)
    public Page<RequestResponseDto> getAll(
            String status, String priority, String category,
            String keyword, Pageable pageable, User currentUser) {

        Specification<Request> spec = Specification.where(null);

        // ASSOCIATEs can only see their own requests
        if (currentUser.getRole() == UserRole.ASSOCIATE) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("createdBy").get("id"), currentUser.getId()));
        }

        if (status != null && !status.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("status"), RequestStatus.valueOf(status.toUpperCase())));
        }

        if (priority != null && !priority.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("priority"), RequestPriority.valueOf(priority.toUpperCase())));
        }

        if (category != null && !category.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("category"), RequestCategory.valueOf(category.toUpperCase())));
        }

        if (keyword != null && !keyword.isBlank()) {
            String pattern = "%" + keyword.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)
            ));
        }

        return requestRepository.findAll(spec, pageable).map(RequestResponseDto::from);
    }

    // ── Get By ID (RBAC aware) ───────────────────────────────
    @Transactional(readOnly = true)
    public RequestResponseDto getById(UUID id, User currentUser) {
        Request request = findOrThrow(id);
        enforceViewAccess(request, currentUser);
        return RequestResponseDto.from(request);
    }

    // ── Update (MANAGER + ADMIN only) ────────────────────────
    @Transactional
    public RequestResponseDto update(UUID id, UpdateRequestDto dto, User currentUser) {
        Request request = findOrThrow(id);

        // ASSOCIATEs cannot update requests
        if (currentUser.getRole() == UserRole.ASSOCIATE) {
            throw new AccessDeniedException("Associates cannot update requests");
        }

        if (dto.getTitle() != null)       request.setTitle(dto.getTitle());
        if (dto.getDescription() != null) request.setDescription(dto.getDescription());
        if (dto.getStatus() != null)      request.setStatus(RequestStatus.valueOf(dto.getStatus().toUpperCase()));
        if (dto.getPriority() != null)    request.setPriority(RequestPriority.valueOf(dto.getPriority().toUpperCase()));
        if (dto.getCategory() != null)    request.setCategory(RequestCategory.valueOf(dto.getCategory().toUpperCase()));

        if (dto.getAssignedToId() != null) {
            User assignee = userRepository.findById(UUID.fromString(dto.getAssignedToId()))
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + dto.getAssignedToId()));
            request.setAssignedTo(assignee);
        }

        return RequestResponseDto.from(requestRepository.save(request));
    }

    // ── Delete (ADMIN only) ──────────────────────────────────
    @Transactional
    public void delete(UUID id, User currentUser) {
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can delete requests");
        }
        Request request = findOrThrow(id);
        requestRepository.delete(request);
    }

    // ── Dashboard summary ────────────────────────────────────
    public DashboardSummary getSummary(User currentUser) {
        if (currentUser.getRole() == UserRole.ASSOCIATE) {
            Specification<Request> mine = (root, query, cb) ->
                    cb.equal(root.get("createdBy").get("id"), currentUser.getId());

            long open       = requestRepository.count(mine.and((r, q, cb) -> cb.equal(r.get("status"), RequestStatus.OPEN)));
            long inProgress = requestRepository.count(mine.and((r, q, cb) -> cb.equal(r.get("status"), RequestStatus.IN_PROGRESS)));
            long resolved   = requestRepository.count(mine.and((r, q, cb) -> cb.equal(r.get("status"), RequestStatus.RESOLVED)));

            return DashboardSummary.builder()
                    .open(open).inProgress(inProgress)
                    .resolved(resolved).total(open + inProgress + resolved)
                    .build();
        }

        return DashboardSummary.builder()
                .open(requestRepository.countByStatus(RequestStatus.OPEN))
                .inProgress(requestRepository.countByStatus(RequestStatus.IN_PROGRESS))
                .resolved(requestRepository.countByStatus(RequestStatus.RESOLVED))
                .total(requestRepository.count())
                .build();
    }

    // ── Helpers ──────────────────────────────────────────────
    private Request findOrThrow(UUID id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + id));
    }

    private void enforceViewAccess(Request request, User currentUser) {
        if (currentUser.getRole() == UserRole.ASSOCIATE &&
            !request.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only view your own requests");
        }
    }

    private RequestPriority parsePriority(String val) {
        if (val == null) return RequestPriority.MEDIUM;
        try { return RequestPriority.valueOf(val.toUpperCase()); }
        catch (IllegalArgumentException e) { return RequestPriority.MEDIUM; }
    }

    private RequestCategory parseCategory(String val) {
        if (val == null) return RequestCategory.OTHER;
        try { return RequestCategory.valueOf(val.toUpperCase()); }
        catch (IllegalArgumentException e) { return RequestCategory.OTHER; }
    }

    // ── Inner DTO for dashboard ──────────────────────────────
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class DashboardSummary {
        private long open;
        private long inProgress;
        private long resolved;
        private long total;
    }
}