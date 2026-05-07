package com.homebase.homebase_backend.request;

import com.homebase.homebase_backend.request.dto.CreateRequestDto;
import com.homebase.homebase_backend.request.dto.RequestResponseDto;
import com.homebase.homebase_backend.request.dto.StatusHistoryResponseDto;
import com.homebase.homebase_backend.request.dto.UpdateRequestDto;
import com.homebase.homebase_backend.team.TeamRepository;
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

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final RequestRepository requestRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;

    // ── Create ───────────────────────────────────────────────
    @Transactional
    public RequestResponseDto create(CreateRequestDto dto, User currentUser) {
        RequestCategory category = parseCategory(dto.getCategory());

        Request request = Request.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(parsePriority(dto.getPriority()))
                .category(category)
                .status(RequestStatus.OPEN)
                .createdBy(currentUser)
                .build();

        // Auto-assign team based on category
        teamRepository.findByCategory(category).ifPresent(request::setTeam);

        Request saved = requestRepository.save(request);

        statusHistoryRepository.save(StatusHistory.builder()
                .request(saved)
                .changedBy(currentUser)
                .oldStatus(null)
                .newStatus(RequestStatus.OPEN.name())
                .build());

        return RequestResponseDto.from(saved);
    }

    // ── Get All (RBAC aware, all filters combined with AND) ──────
    @Transactional(readOnly = true)
    public Page<RequestResponseDto> getAll(
            String status, String priority, String category,
            String keyword, String assignedToId, String dateFrom, String dateTo,
            Pageable pageable, User currentUser) {

        Specification<Request> spec = Specification.where(null);

        if (currentUser.getRole() == UserRole.ASSOCIATE) {
            // ASSOCIATEs see only requests they created
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("createdBy").get("id"), currentUser.getId()));

        } else if (currentUser.getRole() == UserRole.MANAGER) {
            // MANAGERs see only requests belonging to their team
            final UUID managerTeamId = currentUser.getTeam().getId();
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("team").get("id"), managerTeamId));

        } else if (currentUser.getRole() == UserRole.TECHNICIAN) {
            // TECHNICIANs see: created by them OR assigned to their team OR assigned to them
            final UUID techId    = currentUser.getId();
            final UUID techTeamId = currentUser.getTeam() != null ? currentUser.getTeam().getId() : null;
            spec = spec.and((root, query, cb) -> {
                var createdByMe  = cb.equal(root.get("createdBy").get("id"), techId);
                var assignedToMe = cb.equal(root.get("assignedTo").get("id"), techId);
                if (techTeamId != null) {
                    var myTeam = cb.equal(root.get("team").get("id"), techTeamId);
                    return cb.or(createdByMe, assignedToMe, myTeam);
                }
                return cb.or(createdByMe, assignedToMe);
            });
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

        if (assignedToId != null && !assignedToId.isBlank()) {
            if (assignedToId.equals("__unassigned__")) {
                spec = spec.and((root, query, cb) -> cb.isNull(root.get("assignedTo")));
            } else {
                spec = spec.and((root, query, cb) ->
                        cb.equal(root.get("assignedTo").get("id"), UUID.fromString(assignedToId)));
            }
        }

        if (dateFrom != null && !dateFrom.isBlank()) {
            OffsetDateTime from = LocalDate.parse(dateFrom).atStartOfDay().atOffset(ZoneOffset.UTC);
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("createdAt"), from));
        }

        if (dateTo != null && !dateTo.isBlank()) {
            OffsetDateTime to = LocalDate.parse(dateTo).atTime(23, 59, 59).atOffset(ZoneOffset.UTC);
            spec = spec.and((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("createdAt"), to));
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

        if (currentUser.getRole() == UserRole.ASSOCIATE) {
            throw new AccessDeniedException("Associates cannot update requests");
        }

        if (currentUser.getRole() == UserRole.TECHNICIAN) {
            enforceTechnicianUpdate(request, dto, currentUser);
        }

        if (dto.getTitle() != null)       request.setTitle(dto.getTitle());
        if (dto.getDescription() != null) request.setDescription(dto.getDescription());
        if (dto.getPriority() != null)    request.setPriority(RequestPriority.valueOf(dto.getPriority().toUpperCase()));
        if (dto.getCategory() != null)    request.setCategory(RequestCategory.valueOf(dto.getCategory().toUpperCase()));

        if (dto.getStatus() != null) {
            RequestStatus newStatus = RequestStatus.valueOf(dto.getStatus().toUpperCase());
            if (newStatus != request.getStatus()) {
                statusHistoryRepository.save(StatusHistory.builder()
                        .request(request)
                        .changedBy(currentUser)
                        .oldStatus(request.getStatus().name())
                        .newStatus(newStatus.name())
                        .build());
                request.setStatus(newStatus);
            }
        }

        if (dto.getAssignedToId() != null) {
            if (dto.getAssignedToId().isBlank()) {
                request.setAssignedTo(null);
            } else {
                User assignee = userRepository.findById(UUID.fromString(dto.getAssignedToId()))
                        .orElseThrow(() -> new IllegalArgumentException("User not found: " + dto.getAssignedToId()));
                request.setAssignedTo(assignee);
            }
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
        if (currentUser.getRole() == UserRole.MANAGER) {
            final UUID teamId = currentUser.getTeam().getId();
            Specification<Request> teamSpec = (root, query, cb) ->
                    cb.equal(root.get("team").get("id"), teamId);
            long open       = requestRepository.count(teamSpec.and((r, q, cb) -> cb.equal(r.get("status"), RequestStatus.OPEN)));
            long inProgress = requestRepository.count(teamSpec.and((r, q, cb) -> cb.equal(r.get("status"), RequestStatus.IN_PROGRESS)));
            long resolved   = requestRepository.count(teamSpec.and((r, q, cb) -> cb.equal(r.get("status"), RequestStatus.RESOLVED)));
            return DashboardSummary.builder().open(open).inProgress(inProgress)
                    .resolved(resolved).total(open + inProgress + resolved).build();
        }

        if (currentUser.getRole() == UserRole.ASSOCIATE) {
            Specification<Request> mine = (root, query, cb) ->
                    cb.equal(root.get("createdBy").get("id"), currentUser.getId());
            long open       = requestRepository.count(mine.and((r, q, cb) -> cb.equal(r.get("status"), RequestStatus.OPEN)));
            long inProgress = requestRepository.count(mine.and((r, q, cb) -> cb.equal(r.get("status"), RequestStatus.IN_PROGRESS)));
            long resolved   = requestRepository.count(mine.and((r, q, cb) -> cb.equal(r.get("status"), RequestStatus.RESOLVED)));
            return DashboardSummary.builder().open(open).inProgress(inProgress)
                    .resolved(resolved).total(open + inProgress + resolved).build();
        }

        if (currentUser.getRole() == UserRole.TECHNICIAN) {
            Specification<Request> visible = buildTechnicianSpec(currentUser);
            long open       = requestRepository.count(visible.and((r, q, cb) -> cb.equal(r.get("status"), RequestStatus.OPEN)));
            long inProgress = requestRepository.count(visible.and((r, q, cb) -> cb.equal(r.get("status"), RequestStatus.IN_PROGRESS)));
            long resolved   = requestRepository.count(visible.and((r, q, cb) -> cb.equal(r.get("status"), RequestStatus.RESOLVED)));
            return DashboardSummary.builder().open(open).inProgress(inProgress)
                    .resolved(resolved).total(open + inProgress + resolved).build();
        }

        return DashboardSummary.builder()
                .open(requestRepository.countByStatus(RequestStatus.OPEN))
                .inProgress(requestRepository.countByStatus(RequestStatus.IN_PROGRESS))
                .resolved(requestRepository.countByStatus(RequestStatus.RESOLVED))
                .total(requestRepository.count())
                .build();
    }

    // ── Status History ───────────────────────────────────────
    @Transactional(readOnly = true)
    public List<StatusHistoryResponseDto> getHistory(UUID id, User currentUser) {
        Request request = findOrThrow(id);
        enforceViewAccess(request, currentUser);
        return statusHistoryRepository.findByRequestIdOrderByChangedAtAsc(id)
                .stream()
                .map(StatusHistoryResponseDto::from)
                .toList();
    }

    // ── Helpers ──────────────────────────────────────────────
    private Request findOrThrow(UUID id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + id));
    }

    private void enforceViewAccess(Request request, User currentUser) {
        if (currentUser.getRole() == UserRole.ASSOCIATE
                && !request.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only view your own requests");
        }
        if (currentUser.getRole() == UserRole.TECHNICIAN) {
            boolean isCreator     = request.getCreatedBy().getId().equals(currentUser.getId());
            boolean isAssigned    = currentUser.getId().equals(
                    request.getAssignedTo() != null ? request.getAssignedTo().getId() : null);
            boolean isTeamRequest = currentUser.getTeam() != null &&
                    currentUser.getTeam().getId().equals(
                            request.getTeam() != null ? request.getTeam().getId() : null);
            if (!isCreator && !isAssigned && !isTeamRequest) {
                throw new AccessDeniedException("You do not have access to this request");
            }
        }
    }

    // ── Technician helpers ───────────────────────────────────
    private Specification<Request> buildTechnicianSpec(User technician) {
        final UUID techId    = technician.getId();
        final UUID techTeamId = technician.getTeam() != null ? technician.getTeam().getId() : null;
        return (root, query, cb) -> {
            var createdByMe  = cb.equal(root.get("createdBy").get("id"), techId);
            var assignedToMe = cb.equal(root.get("assignedTo").get("id"), techId);
            if (techTeamId != null) {
                var myTeam = cb.equal(root.get("team").get("id"), techTeamId);
                return cb.or(createdByMe, assignedToMe, myTeam);
            }
            return cb.or(createdByMe, assignedToMe);
        };
    }

    private void enforceTechnicianUpdate(Request request, UpdateRequestDto dto, User technician) {
        boolean isTeamRequest  = technician.getTeam() != null &&
                technician.getTeam().getId().equals(
                        request.getTeam() != null ? request.getTeam().getId() : null);
        boolean isAssignedToMe = technician.getId().equals(
                request.getAssignedTo() != null ? request.getAssignedTo().getId() : null);

        if (!isTeamRequest && !isAssignedToMe) {
            throw new AccessDeniedException("You do not have access to this request");
        }

        // Cannot change request details — only assignment and status
        if (dto.getTitle() != null || dto.getDescription() != null
                || dto.getPriority() != null || dto.getCategory() != null) {
            throw new AccessDeniedException("Technicians cannot edit request details");
        }

        // Can only assign to themselves
        if (dto.getAssignedToId() != null && !dto.getAssignedToId().isBlank()
                && !dto.getAssignedToId().equals(technician.getId().toString())) {
            throw new AccessDeniedException("Technicians can only assign requests to themselves");
        }

        // Can only update status if already assigned to them (or being picked up in the same call)
        boolean pickingUp = dto.getAssignedToId() != null &&
                dto.getAssignedToId().equals(technician.getId().toString());
        if (dto.getStatus() != null && !isAssignedToMe && !pickingUp) {
            throw new AccessDeniedException("Assign the request to yourself before changing its status");
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